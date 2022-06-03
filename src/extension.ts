// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import { exec } from "child_process";
import { Console } from "console";
import { NONAME } from "dns";
import * as vscode from "vscode";
// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  console.log('Congratulations, your extension "boxxer" is now active!');

  //get current worskpace name if the window ever closes
  //  let currentWorskpace = vscode.workspace.name;

  let buildContainer = vscode.commands.registerCommand(
    "boxxer.buildContainer",
    () => {
      const terminal = vscode.window.createTerminal("Build Container");
      terminal.show();

      terminal.sendText(`docker build -t ${vscode.workspace.name} .`);
    }
  );

  let composeBuildContainer = vscode.commands.registerCommand(
    "boxxer.composeBuildContainer",
    () => {
      const terminal = vscode.window.createTerminal("Compose Build Container");
      terminal.show();

      terminal.sendText(`cd .devcontainer`);
      terminal.sendText(`docker-compose build`);
    }
  );

  let buildWithSpecifiedFolder = vscode.commands.registerCommand(
    "boxxer.buildWithSpecifiedFolder",
    () => {
      const options: vscode.OpenDialogOptions = {
        canSelectMany: false,
        canSelectFiles: false,
        canSelectFolders: true,
      };

      const terminal = vscode.window.createTerminal("Bulid Container");
      terminal.show();

      vscode.window.showOpenDialog(options).then((fileUri) => {
        if (fileUri && fileUri[0]) {
          terminal.sendText(fileUri[0].path);
          terminal.sendText(
            `docker build -t ${vscode.workspace.name} ${fileUri[0].path}/`
          );
        }
      });
    }
  );

  let openWorkspaceInContainer = vscode.commands.registerCommand(
    "boxxer.openWorkspaceInContainer",
    () => {
      const terminal = vscode.window.createTerminal("Remote Container");
      terminal.show();

      terminal.sendText(
        `docker run -v "${vscode.workspace.rootPath}":/workspace ${vscode.workspace.name}`
      );
    }
  );

  let openShellInContainer = vscode.commands.registerCommand(
    "boxxer.openShellInContainer",
    () => {
      const terminal = vscode.window.createTerminal("Remote container");
      terminal.show();
      const { exec } = require("child_process");
      exec(
        `docker ps | grep ${vscode.workspace.name}`,
        (error: any, stdout: any, stderr: any) => {
          if (error) {
            return;
          }

          //terminal.sendText(`${stderr}`);

          //gets the first word, which is the container ID
          var firstWord = stdout.split(" ")[0];

          terminal.sendText(`docker exec -it ${firstWord} /bin/bash`);
          terminal.sendText(`cd workspace`);
        }
      );
    }
  );

  let closeCurrentContainer = vscode.commands.registerCommand(
    "boxxer.closeCurrentContainer",
    () => {
      const { exec } = require("child_process");
      var firstWord;
      exec(
        `docker ps | grep ${vscode.workspace.name}`,
        (error: any, stdout: any, stderr: any) => {
          if (error) {
            return;
          }

          //terminal.sendText(`${stderr}`);

          //gets the first word, which is the container ID
          firstWord = stdout.split(" ")[0];
          exec(
            `docker stop ${firstWord}`,
            (error: any, stdout: any, stderr: any) => {
              if (error) {
                return;
              }
            }
          );
        }
      );
    }
  );
  //using docker cp ./filename CONTAINER_ID:/home/userdir/ for files which are being modified

  // doesn't fully work, but is probably unnecessary either way
  // requires the currentWorspace=vscode.worskpace.name to be uncommented at the top
  //  vscode.workspace.onDidChangeWorkspaceFolders(function hello() {
  //    const { exec } = require("child_process");
  //    var firstWord;
  //    exec(
  //      `docker ps | grep ${currentWorskpace}`,
  //      (error: any, stdout: any, stderr: any) => {
  //        if (error) {
  //          return;
  //        }
  //
  //        //terminal.sendText(`${stderr}`);
  //
  //        //gets the first word, which is the container ID
  //        firstWord = stdout.split(" ")[0];
  //        //update current workspace
  //        currentWorskpace = vscode.workspace.name;
  //        exec(
  //          `docker stop ${firstWord}`,
  //          (error: any, stdout: any, stderr: any) => {
  //            if (error) {
  //              return;
  //            }
  //          }
  //        );
  //      }
  //    );
  //  });

  context.subscriptions.push(buildContainer);
  context.subscriptions.push(composeBuildContainer);
  context.subscriptions.push(openWorkspaceInContainer);
  context.subscriptions.push(buildWithSpecifiedFolder);
  context.subscriptions.push(openShellInContainer);
  context.subscriptions.push(closeCurrentContainer);
}

// this method is called when your extension is deactivated, also when editor is closed
export function deactivate() {
  //close current container (might be unnecessary or even in the way of developers)
  const { exec } = require("child_process");
  var firstWord;
  exec(
    `docker ps | grep ${vscode.workspace.name}`,
    (error: any, stdout: any, stderr: any) => {
      if (error) {
        return;
      }

      //terminal.sendText(`${stderr}`);

      //gets the first word, which is the container ID
      firstWord = stdout.split(" ")[0];
      exec(
        `docker stop ${firstWord}`,
        (error: any, stdout: any, stderr: any) => {
          if (error) {
            return;
          }
        }
      );
    }
  );
}
