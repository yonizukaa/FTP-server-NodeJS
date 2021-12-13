import { Socket } from "dgram";
import { readFile } from "fs";
import { createServer } from "net";
import {exit} from "process";


const fs = require("fs");

export function launch(port) {
  const server = createServer((socket) => {
    console.log("new connection.");
    socket.on("data", (data) => {
      const message = data.toString();

      const [command, ...args] = message.trim().split(" ");
      console.log(command, args);

      switch(command) {

        //CAS Utilisateur
        case "USER":
          const username =JSON.parse(fs.readFileSync("C:/Users/johan/OneDrive/Bureau/my-ftp-live-main/server/Users.json","utf-8")) ;
          
          username.forEach(element => { 
            if (element.name == args[0]){
              socket.password = element.Password
            
              socket.write("BON");
              

             
              }
               else{
              socket.write("MAUVAIS username");
              }

          });
          
          
          break;
          
          // CAS mdp
          case "PASS":
            if (args[0] == undefined || args[0] != socket.password) 
            {
              socket.write('ERREUR entrez une mot de passe valide\r\n');
            }
            else if (args[0] == socket.password)
            {
              socket.write('331 VOUS ETES CONNECTE\r\n');
             
            
            }
            break;
        


              // CAS PWD
          case "PWD":
            socket.write(`257, ${process.cwd()} \r\n`);
            break;


            //cas CWD
          case "CWD":
            try {
            process.chdir(args[0]);
            socket.write(`250, ${process.cwd()} \r\n`);
            break;
            }
            catch(err)
            {
              socket.write(`pas trouvé le repertoire ou vous voulez aller\r\n`);
            }
            break;
          
        //List case
        case "LIST": //List all the files in the current directory
          try {
            let list = "";
            let loc = fs.readdirSync(process.cwd());
            loc.forEach((file) => {
              list += file + "\r\n";
            });
            socket.write("Current directory filenames: \r\n" + list);
          }
           catch (erreur) 
           {
            console.log(erreur);
            socket.write("Couldn't display current directory's listing, please try again.\r\n");
          }
          break;

          //cas STOR
          case "STOR":
            socket.write( "125 \r\n");
          break;


             //cas RETR
             case "RETR":
              socket.write( "150 \r\n");
            break;
        

         


          // aide cas
          case "HELP":
            socket.write("  211","USER <username>: Login\r\n"+
                        "PASS <password>: Login\r\n"+
                        "LIST:Liste les fichier dans le repertoire courant \r\n"+
                        "CWD <directory>: change le dossier courant\r\n"+
                        "RETR <filename>: transfer une copy du fichier dans le client depuis le server\r\n"+
                        "STOR <filename>: transfer une copy du fichier dans le server depuis le client\r\n"+
                        "PWD: affiche le dossier dans lequel on est\r\n"+
                        "QUIT: ferme le programme\r\n");
            break;
          
            // CAS QUITER
          case "QUIT":
          socket.write( "221 \r\n");
          socket.write(process.exit());
          break;  

        // cas par défaut  
        default:
          console.log("command not supported: press HELP for more information", command, args);
      }
    });

    socket.write("220 Hello World \r\n");
  });

  server.listen(port, () => {
    console.log(`server started at localhost:${port}`);
  });
}
