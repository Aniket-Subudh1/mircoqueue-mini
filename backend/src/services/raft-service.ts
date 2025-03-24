import { RAFT } from '../common/constants';
import logger from '../common/logger';


enum NodeState {
  FOLLOWER = 'follower',
  CANDIDATE = 'candidate',
  LEADER = 'leader',
}


interface NodeConfig {
  nodeId: string;
  peersEndpoints: string[];
}


interface LogEntry {
  term: number;
  index: number;
  command: any;
}


interface AppendEntriesRequest {
  term: number;
  leaderId: string;
  prevLogIndex: number;
  prevLogTerm: number;
  entries: LogEntry[];
  leaderCommit: number;
}

interface AppendEntriesResponse {
  term: number;
  success: boolean;
  nodeId: string;
}

interface RequestVoteRequest {
  term: number;
  candidateId: string;
  lastLogIndex: number;
  lastLogTerm: number;
}

interface RequestVoteResponse {
  term: number;
  voteGranted: boolean;
  nodeId: string;
}


type RpcMethod = (peer: string, request: any) => Promise<any>;


export class RaftNode {
  private state: NodeState;
  private currentTerm: number;
  private votedFor: string | null;
  private log: LogEntry[];
  private commitIndex: number;
  private lastApplied: number;
  private nextIndex: Map<string, number>;
  private matchIndex: Map<string, number>;
  private electionTimeout: NodeJS.Timeout | null;
  private heartbeatInterval: NodeJS.Timeout | null;
  private votesReceived: Set<string>;
  private electionTimeoutMs: number = 0;
  private isShutdown: boolean;
  private leaderEndpoint: string | null = null;
  private commandCallbacks: Map<number, { resolve: Function; reject: Function }>;
  private rpcMethod: RpcMethod | null = null;

  constructor(private config: NodeConfig) {

    this.state = NodeState.FOLLOWER;
    this.currentTerm = 0;
    this.votedFor = null;
    this.log = [];
    this.commitIndex = 0;
    this.lastApplied = 0;
    this.nextIndex = new Map();
    this.matchIndex = new Map();
    this.electionTimeout = null;
    this.heartbeatInterval = null;
    this.votesReceived = new Set();
    this.isShutdown = false;
    this.commandCallbacks = new Map();

 
    this.resetElectionTimeout();

    logger.info('Raft node initialized', {
      nodeId: this.config.nodeId,
      state: this.state,
      peers: this.config.peersEndpoints.length,
    });
  }

  public setRpcMethod(method: RpcMethod): void {
    this.rpcMethod = method;
  }

 
  public start(): void {
    logger.info('Starting Raft node', { nodeId: this.config.nodeId });
    this.isShutdown = false;
    this.resetElectionTimeout();
  }

  public shutdown(): void {
    logger.info('Shutting down Raft node', { nodeId: this.config.nodeId });
    this.isShutdown = true;
    
    if (this.electionTimeout) {
      clearTimeout(this.electionTimeout);
      this.electionTimeout = null;
    }
    
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
    
  
    this.commandCallbacks.forEach((callbacks) => {
      callbacks.reject(new Error('Node shutdown'));
    });
    this.commandCallbacks.clear();
  }

 
  public isLeader(): boolean {
    return this.state === NodeState.LEADER;
  }

  public getLeaderEndpoint(): string | null {
    return this.leaderEndpoint;
  }

  public getState(): { state: string; term: number; nodeId: string } {
    return {
      state: this.state,
      term: this.currentTerm,
      nodeId: this.config.nodeId,
    };
  }


  private resetElectionTimeout(): void {
    if (this.isShutdown) return;

    if (this.electionTimeout) {
      clearTimeout(this.electionTimeout);
    }

    this.electionTimeoutMs = Math.floor(
      Math.random() * (RAFT.ELECTION_TIMEOUT_MAX_MS - RAFT.ELECTION_TIMEOUT_MIN_MS) + 
      RAFT.ELECTION_TIMEOUT_MIN_MS
    );

    this.electionTimeout = setTimeout(() => {
      this.startElection();
    }, this.electionTimeoutMs);
  }

 
  private startElection(): void {
    if (this.isShutdown || this.state === NodeState.LEADER) return;

    logger.info('Starting election', { nodeId: this.config.nodeId, term: this.currentTerm + 1 });

    
    this.state = NodeState.CANDIDATE;
    this.currentTerm += 1;
    this.votedFor = this.config.nodeId; // Vote for self
    this.votesReceived = new Set([this.config.nodeId]); // Count self vote

   
    this.resetElectionTimeout();

    this.requestVotes();
  }

  private async requestVotes(): Promise<void> {
    if (this.isShutdown || !this.rpcMethod) return;

    const lastLogIndex = this.log.length;
    const lastLogTerm = lastLogIndex > 0 ? this.log[lastLogIndex - 1].term : 0;

    const request: RequestVoteRequest = {
      term: this.currentTerm,
      candidateId: this.config.nodeId,
      lastLogIndex,
      lastLogTerm,
    };

    logger.debug('Sending RequestVote to peers', { request });

   
    for (const peer of this.config.peersEndpoints) {
      try {
        const response = await this.rpcMethod(peer, {
          method: 'RequestVote',
          body: request,
        });

        this.handleRequestVoteResponse(response);
      } catch (error) {
        logger.error('Error sending RequestVote to peer', { error, peer });
      }
    }
  }


  private handleRequestVoteResponse(response: RequestVoteResponse): void {
    if (this.isShutdown || this.state !== NodeState.CANDIDATE) return;

 
    if (response.term > this.currentTerm) {
      this.becomeFollower(response.term);
      return;
    }

 
    if (response.voteGranted) {
      this.votesReceived.add(response.nodeId);


      if (this.votesReceived.size > (this.config.peersEndpoints.length + 1) / 2) {
        this.becomeLeader();
      }
    }
  }

 
  private becomeLeader(): void {
    if (this.isShutdown) return;

    logger.info('Becoming leader', { nodeId: this.config.nodeId, term: this.currentTerm });
   
    this.state = NodeState.LEADER;
    this.leaderEndpoint = `${this.config.nodeId}`;
    
    
    this.config.peersEndpoints.forEach(peer => {
      this.nextIndex.set(peer, this.log.length + 1);
      this.matchIndex.set(peer, 0);
    });
    
   
    if (this.electionTimeout) {
      clearTimeout(this.electionTimeout);
      this.electionTimeout = null;
    }
    
  
    this.startHeartbeat();
  }


  private startHeartbeat(): void {
    if (this.isShutdown) return;
    
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }
    
    this.heartbeatInterval = setInterval(() => {
      this.sendHeartbeat();
    }, RAFT.HEARTBEAT_INTERVAL_MS);
    
    
    this.sendHeartbeat();
  }

  private sendHeartbeat(): void {
    if (this.isShutdown || this.state !== NodeState.LEADER || !this.rpcMethod) return;
    
    this.config.peersEndpoints.forEach(peer => {
      this.sendAppendEntries(peer, []);
    });
  }

  private async sendAppendEntries(peer: string, entries: LogEntry[]): Promise<void> {
    if (this.isShutdown || this.state !== NodeState.LEADER || !this.rpcMethod) return;
    
    const nextIdx = this.nextIndex.get(peer) || this.log.length + 1;
    const prevLogIndex = nextIdx - 1;
    const prevLogTerm = prevLogIndex > 0 && prevLogIndex <= this.log.length 
      ? this.log[prevLogIndex - 1].term 
      : 0;
    
    const request: AppendEntriesRequest = {
      term: this.currentTerm,
      leaderId: this.config.nodeId,
      prevLogIndex,
      prevLogTerm,
      entries: entries.length > 0 ? entries : [],
      leaderCommit: this.commitIndex
    };
    
    logger.debug('Sending AppendEntries', { peer, entries: entries.length });
    
    try {
      const response = await this.rpcMethod(peer, {
        method: 'AppendEntries',
        body: request,
      });
      
      this.handleAppendEntriesResponse(peer, request, response);
    } catch (error) {
      logger.error('Error sending AppendEntries to peer', { error, peer });
    }
  }

 
  private handleAppendEntriesResponse(
    peer: string, 
    request: AppendEntriesRequest, 
    response: AppendEntriesResponse
  ): void {
    if (this.isShutdown || this.state !== NodeState.LEADER) return;
    
    // If response term is higher, revert to follower
    if (response.term > this.currentTerm) {
      this.becomeFollower(response.term);
      return;
    }
    
    if (response.success) {
      // Update nextIndex and matchIndex for the peer
      if (request.entries.length > 0) {
        const lastEntryIndex = request.prevLogIndex + request.entries.length;
        this.nextIndex.set(peer, lastEntryIndex + 1);
        this.matchIndex.set(peer, lastEntryIndex);
        
      
        this.updateCommitIndex();
      }
    }
    else {
      // Decrement nextIndex and retry
      const currentNextIndex = this.nextIndex.get(peer) || this.log.length + 1;
      this.nextIndex.set(peer, Math.max(1, currentNextIndex - 1));
      
      // Retry with earlier log entries
      setTimeout(() => {
        this.sendAppendEntries(peer, []);
      }, 50);
    }
  }

 
  private updateCommitIndex(): void {
    if (this.isShutdown || this.state !== NodeState.LEADER) return;
    
    // Get all matchIndex values
    const matchIndices = Array.from(this.matchIndex.values());
    
    // Add our own log length
    matchIndices.push(this.log.length);
    
    // Sort in ascending order
    matchIndices.sort((a, b) => a - b);
    
    // Get the median value (majority)
    const majorityIndex = Math.floor(matchIndices.length / 2);
    const newCommitIndex = matchIndices[majorityIndex];
    
    
    if (newCommitIndex > this.commitIndex && 
        (newCommitIndex === 0 || this.log[newCommitIndex - 1].term === this.currentTerm)) {
      this.commitIndex = newCommitIndex;
      
     
      this.applyCommittedEntries();
    }
  }

  
  private applyCommittedEntries(): void {
    if (this.isShutdown) return;
    
    while (this.lastApplied < this.commitIndex) {
      this.lastApplied++;
      const entry = this.log[this.lastApplied - 1];
      
      // Apply the command (in a real system, this would update state machine)
      logger.info('Applying log entry', { entry, index: this.lastApplied });
      
      // Resolve any pending promises for this command
      const callback = this.commandCallbacks.get(entry.index);
      if (callback) {
        callback.resolve(true);
        this.commandCallbacks.delete(entry.index);
      }
    }
  }

 
  private becomeFollower(term: number): void {
    if (this.isShutdown) return;
    
    logger.info('Becoming follower', { nodeId: this.config.nodeId, term });
    
    this.state = NodeState.FOLLOWER;
    this.currentTerm = term;
    this.votedFor = null;
    
    // Stop leader heartbeat if active
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
    
 
    this.resetElectionTimeout();
  }

  
  public processAppendEntries(request: AppendEntriesRequest): AppendEntriesResponse {
    if (this.isShutdown) {
      return { term: this.currentTerm, success: false, nodeId: this.config.nodeId };
    }
    
    logger.debug('Processing AppendEntries', { 
      from: request.leaderId, 
      entries: request.entries.length,
      term: request.term
    });
    
    // 1. Reply false if term < currentTerm
    if (request.term < this.currentTerm) {
      return { term: this.currentTerm, success: false, nodeId: this.config.nodeId };
    }
    
    // If term is higher or we receive AppendEntries from leader, update leader info
    if (request.term >= this.currentTerm) {
      // Update leader information
      this.leaderEndpoint = request.leaderId;
      
      // If term is higher, become follower
      if (request.term > this.currentTerm) {
        this.becomeFollower(request.term);
      } else if (this.state === NodeState.CANDIDATE) {
        // If we're a candidate and we receive AppendEntries from valid leader, revert to follower
        this.becomeFollower(request.term);
      }
    }
    

    this.resetElectionTimeout();
    

    if (request.prevLogIndex > 0) {
      if (this.log.length < request.prevLogIndex) {
        return { term: this.currentTerm, success: false, nodeId: this.config.nodeId };
      }
      
      if (this.log[request.prevLogIndex - 1].term !== request.prevLogTerm) {
        return { term: this.currentTerm, success: false, nodeId: this.config.nodeId };
      }
    }
    
   
    if (request.entries.length > 0) {
     
      let newEntryIndex = request.prevLogIndex;
      
      for (const entry of request.entries) {
        newEntryIndex++;
        
        
        if (this.log.length >= newEntryIndex && 
            this.log[newEntryIndex - 1].term !== entry.term) {
          this.log = this.log.slice(0, newEntryIndex - 1);
        }
        
     
        if (this.log.length < newEntryIndex) {
          this.log.push(entry);
        }
      }
    }
    

    if (request.leaderCommit > this.commitIndex) {
      this.commitIndex = Math.min(request.leaderCommit, this.log.length);
      this.applyCommittedEntries();
    }
    
    return { term: this.currentTerm, success: true, nodeId: this.config.nodeId };
  }

  public processRequestVote(request: RequestVoteRequest): RequestVoteResponse {
    if (this.isShutdown) {
      return { term: this.currentTerm, voteGranted: false, nodeId: this.config.nodeId };
    }
    
    logger.debug('Processing RequestVote', { 
      from: request.candidateId,
      term: request.term
    });
    

    if (request.term < this.currentTerm) {
      return { term: this.currentTerm, voteGranted: false, nodeId: this.config.nodeId };
    }
    
    if (request.term > this.currentTerm) {
      this.becomeFollower(request.term);
    }
    
   
    const lastLogIndex = this.log.length;
    const lastLogTerm = lastLogIndex > 0 ? this.log[lastLogIndex - 1].term : 0;
    
    const logOk = (request.lastLogTerm > lastLogTerm) || 
                 (request.lastLogTerm === lastLogTerm && request.lastLogIndex >= lastLogIndex);
                 
    if ((this.votedFor === null || this.votedFor === request.candidateId) && logOk) {
   
      this.votedFor = request.candidateId;
      this.resetElectionTimeout();
      return { term: this.currentTerm, voteGranted: true, nodeId: this.config.nodeId };
    }
    
    return { term: this.currentTerm, voteGranted: false, nodeId: this.config.nodeId };
  }

 
  public submitCommand(command: any): Promise<boolean> {
    return new Promise((resolve, reject) => {
      if (this.isShutdown) {
        reject(new Error('Node is shutdown'));
        return;
      }
      
      if (this.state !== NodeState.LEADER) {
        reject(new Error('Not the leader'));
        return;
      }
      
     
      const entry: LogEntry = {
        term: this.currentTerm,
        index: this.log.length + 1,
        command
      };
      
      this.commandCallbacks.set(entry.index, { resolve, reject });
      
   
      this.log.push(entry);
      
    
      this.config.peersEndpoints.forEach(peer => {
        this.sendAppendEntries(peer, [entry]);
      });
      

      const timeout = setTimeout(() => {
        if (this.commitIndex >= entry.index) {
          resolve(true);
        } else {
         
          this.commandCallbacks.delete(entry.index);
          resolve(false);
        }
      }, 5000); 
    });
  }
}

let raftNodeInstance: RaftNode | null = null;

export const initializeRaftNode = (config: NodeConfig): RaftNode => {
  if (raftNodeInstance) {
    raftNodeInstance.shutdown();
  }
  
  raftNodeInstance = new RaftNode(config);
  return raftNodeInstance;
};

export const getRaftNode = (): RaftNode | null => {
  return raftNodeInstance;
};

export default {
  RaftNode,
  initializeRaftNode,
  getRaftNode
};