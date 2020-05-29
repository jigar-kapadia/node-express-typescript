import {Server} from './server';

const server = new Server();
server.listen(port => console.log(`server connected at ${port}`));