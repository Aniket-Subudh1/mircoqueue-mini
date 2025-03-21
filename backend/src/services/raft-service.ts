import { RAFT } from '../common/constants';
import logger from '../common/logger';

// Raft node states
enum NodeState {
  FOLLOWER = 'follower',
  CANDIDATE = 'candidate',
  LEADER = 'leader',
}

// Node configuration
interface NodeConfig {
  nodeId: string;
  peersEndpoints: string[];
}

// Log entry
interface LogEntry {
  term: number;
  index: number;
  command: any;
}

// Simplified RPC request types
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

  constructor(private config: NodeConfig) {
    // Initialize Raft state
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

    // Initialize random election timeout between min and max
    this.resetElectionTimeout();

    logger.info('Raft node initialized', {
      nodeId: this.config.nodeId,
      state: this.state,
      peers: this.config.peersEndpoints.length,
    });
  }

  /**
   * Start the Raft node
   */
  public start(): void {
    logger.info('Starting Raft node', { nodeId: this.config.nodeId });
    this.isShutdown = false;
    this.resetElectionTimeout();
  }

  /**
   * Shutdown the Raft node
   */
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
  }

  /**
   * Reset election timeout with random duration
   */
  private resetElectionTimeout(): void {
    if (this.isShutdown) return;

    if (this.electionTimeout) {
      clearTimeout(this.electionTimeout);
    }

    // Set random timeout between min and max
    this.electionTimeoutMs = Math.floor(
      Math.random() * (RAFT.ELECTION_TIMEOUT_MAX_MS - RAFT.ELECTION_TIMEOUT_MIN_MS) + 
      RAFT.ELECTION_TIMEOUT_MIN_MS
    );

    this.electionTimeout = setTimeout(() => {
      this.startElection();
    }, this.electionTimeoutMs);
  }

 
  private startElection(): void {
    if (this.isShutdown) return;

    logger.info('Starting election', { nodeId: this.config.nodeId, term: this.currentTerm + 1 });

    // Transition to candidate state
    this.state = NodeState.CANDIDATE;
    this.currentTerm += 1;
    this.votedFor = this.config.nodeId; // Vote for self
    this.votesReceived = new Set([this.config.nodeId]); // Count self vote

    // Reset election timeout
    this.resetElectionTimeout();

    // Send RequestVote RPCs to all peers
    this.requestVotes();
  }

  
  private requestVotes(): void {
    if (this.isShutdown) return;

    const lastLogIndex = this.log.length > 0 ? this.log.length - 1 : 0;
    const lastLogTerm = this.log.length > 0 ? this.log[lastLogIndex].term : 0;

    const request: RequestVoteRequest = {
      term: this.currentTerm,
      candidateId: this.config.nodeId,
      lastLogIndex,
      lastLogTerm,
    };

    // In a real implementation, this would send actual network requests
    // For the simulation, we'll just log the request
    logger.debug('Sending RequestVote to peers', { request });

    // Simulate vote responses (would be network calls in real implementation)
    this.simulateVoteResponses();
  }


  private simulateVoteResponses(): void {
    if (this.isShutdown) return;

    // Simulate random vote responses
    const peersCount = this.config.peersEndpoints.length;
    
    // Simulate getting votes from a majority of peers (~70% success rate)
    const successfulVotes = Math.floor(peersCount * 0.7);
    
    for (let i = 0; i < successfulVotes; i++) {
      // Simulate receiving a vote
      this.votesReceived.add(`peer-${i}`);
      
      // Check if we have a majority
      if (this.votesReceived.size > (peersCount + 1) / 2) {
        this.becomeLeader();
        break;
      }
    }
  }


  private becomeLeader(): void {
    if (this.isShutdown) return;

    logger.info('Becoming leader', { nodeId: this.config.nodeId, term: this.currentTerm });
    
    // Transition to leader state
    this.state = NodeState.LEADER;
    
    // Initialize nextIndex and matchIndex for all peers
    this.config.peersEndpoints.forEach(peer => {
      this.nextIndex.set(peer, this.log.length);
      this.matchIndex.set(peer, 0);
    });
    
    // Cancel election timeout
    if (this.electionTimeout) {
      clearTimeout(this.electionTimeout);
      this.electionTimeout = null;
    }
    
    
  }
}