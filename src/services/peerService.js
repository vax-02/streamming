import { Peer } from "peerjs";

export const createPeer = (id = null) => {
  return new Peer(id, {
    host: 'localhost',
    port: 3001,
    path: '/',
    secure: false
  });
};