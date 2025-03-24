import { RaftNode, initializeRaftNode, getRaftNode } from './raft-service';
import { logger } from '../common/logger';
import { STAGE } from '../common/constants';
import axios from 'axios';

export const discoverPeers = async (): Promise<string[]> => {
  logger.info('Discovering Raft peers');
  
  if (process.env.RAFT_PEERS) {
    return process.env.RAFT_PEERS.split(',');
  }
  
  if (STAGE === 'dev') {
    return [
      'http://localhost:3001/raft',
      'http://localhost:3002/raft',
      'http://localhost:3003/raft',
    ];
  }
  
  return [
    `https://microqueue-node1-${STAGE}.example.com/raft`,
    `https://microqueue-node2-${STAGE}.example.com/raft`,
    `https://microqueue-node3-${STAGE}.example.com/raft`,
  ];
};

export const setupCluster = async () => {
  try {
    const peers = await discoverPeers();
    const nodeId = process.env.NODE_ID || `node-${Math.floor(Math.random() * 10000)}`;
    
    const raftNode = initializeRaftNode({
      nodeId,
      peersEndpoints: peers,
    });
    
    raftNode.setRpcMethod(async (peer: string, request: any) => {
      try {
        const response = await axios.post(`${peer}/${request.method.toLowerCase()}`, request.body, {
          headers: { 'Content-Type': 'application/json' },
          timeout: 3000, // 3 second timeout
        });
        return response.data;
      } catch (error) {
        logger.error('RPC error', { error, peer, method: request.method });
        throw error;
      }
    });
    
    raftNode.start();
    logger.info('Cluster setup complete', { nodeId, peersCount: peers.length });
  } catch (error) {
    logger.error('Error setting up cluster', { error });
  }
};

export const handleAppendEntries = (request: any): any => {
  const raftNode = getRaftNode();
  if (!raftNode) {
    throw new Error('Raft node not initialized');
  }
  
  return raftNode.processAppendEntries(request);
};

export const handleRequestVote = (request: any): any => {
  const raftNode = getRaftNode();
  if (!raftNode) {
    throw new Error('Raft node not initialized');
  }
  
  return raftNode.processRequestVote(request);
};

export const submitCommand = async (command: any): Promise<boolean> => {
  const raftNode = getRaftNode();
  if (!raftNode) {
    throw new Error('Raft node not initialized');
  }
  
  if (!raftNode.isLeader()) {
    const leaderEndpoint = raftNode.getLeaderEndpoint();
    if (leaderEndpoint) {
      try {
        const response = await axios.post(`${leaderEndpoint}/command`, command, {
          headers: { 'Content-Type': 'application/json' },
          timeout: 5000,
        });
        return response.data.success;
      } catch (error) {
        logger.error('Error forwarding command to leader', { error, leader: leaderEndpoint });
        throw new Error('Failed to forward command to leader');
      }
    }
    throw new Error('No leader available');
  }
  
  return raftNode.submitCommand(command);
};

export const getClusterStatus = () => {
  const raftNode = getRaftNode();
  if (!raftNode) {
    return { initialized: false };
  }
  
  return {
    initialized: true,
    ...raftNode.getState(),
    isLeader: raftNode.isLeader(),
    leader: raftNode.getLeaderEndpoint(),
  };
};

export default {
  discoverPeers,
  setupCluster,
  handleAppendEntries,
  handleRequestVote,
  submitCommand,
  getClusterStatus,
};