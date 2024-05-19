import * as files from 'fs';
import * as Path from 'path';
import { DATA_SOURCES } from '../config/vars.config';
const dataSource = DATA_SOURCES.applicationDataSource;

export const initializeCertificates = ()  => {
    try {
      if(dataSource.USE_LETS_ENCRYPT){
        const privateKey = files.readFileSync('/etc/letsencrypt/live/2189f9c.online-server.cloud/privkey.pem', 'utf8');
        const certificate = files.readFileSync('/etc/letsencrypt/live/2189f9c.online-server.cloud/cert.pem', 'utf8');
        const ca = files.readFileSync('/etc/letsencrypt/live/2189f9c.online-server.cloud/chain.pem', 'utf8');
        return {
            key: privateKey,
            cert: certificate,
            ca
        };
      }else{
        const privateKey = files.readFileSync(Path.join(__dirname, '..', 'certificates/key.pem'), 'utf8')
        const certificate = files.readFileSync(Path.join(__dirname, '..', 'certificates/server.crt'), 'utf8')
        return { key: privateKey, cert: certificate, ca: "" }
      }
    } catch (error) {
      console.error('[SecurityError]: ', error);
      throw new Error('failed to initialize Security');
    }
  };