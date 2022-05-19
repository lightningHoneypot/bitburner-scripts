/** @param {NS} ns **/
export async function main(ns) {
    // Get all the tools out
    var script = "early-hack-template.js"
    var scriptRAM = ns.getScriptRam(script)
    var homeRAM = ns.getServerMaxRam("home")
    let portOpeningTools = [
        ["BruteSSH.exe", ns.brutessh],
        ["FTPCrack.exe", ns.ftpcrack],
        ["SQLInject.exe", ns.sqlinject],
        ["relaySMTP.exe", ns.relaysmtp],
        ["HTTPWorm.exe", ns.httpworm],
    ];
    // Check the current amount of port crackers that the player has.
    var portsAvailable = ns.fileExists("BruteSSH.exe", "home") +
        ns.fileExists("FTPCrack.exe", "home") +
        ns.fileExists("RelaySMTP.exe", "home") +
        ns.fileExists("HTTPWorm.exe", "home") +
        ns.fileExists("SQLInject.exe", "home");
    
    function spider() {
        // Create an array for all the servers
        // Coder comment: At the moment, I couldn't find a spolier free scanner
        // if there is one let me know.
        // Snippit of code is from: 
        // https://www.reddit.com/r/Bitburner/comments/rjppeo/complete_script_for_scanning_rooting_and/
        // Return an array of all identifiable servers
        // Create a serversSeen array, containing only 'home' for now
        var serversSeen = ['home'];
        // For every server we've seen so far, do a scan
        for (var i = 0; i < serversSeen.length; i++) {
            let thisScan = ns.scan(serversSeen[i]);
            // Loop through results of the scan, and add any new servers
            for (var j = 0; j < thisScan.length; j++) {
                // If this server isn't in serversSeen, add it
                if (serversSeen.indexOf(thisScan[j]) === -1) {
                    serversSeen.push(thisScan[j]);
                }
            }
        }
        return serversSeen;
    }

    if (portsAvailable != 5) {
        // Creates another array that contains the port cracker that the player currently has.
        // Parts of this code is from:
        // https://www.reddit.com/r/Bitburner/comments/rpv9ps/comment/hq8aywx/?utm_source=share&utm_medium=web2x&context=3
        var availablePortOpeningTools = portOpeningTools.filter(
            ([toolName, _toolFunc]) => ns.fileExists(toolName, "home")
        );
    }

    var hostnames = spider(); // Starts the spider function
    hostnames.splice(0, 1) // Removes "home"
    var ownedServers = ns.getPurchasedServers()             // Creates an array 
    for (let i = 0; i < ownedServers.length; i++) {         // and the for loop checks
        let checkifOwned = ownedServers[i];
        let hostnameIndex = hostnames.indexOf(checkifOwned) // if the hostnames array has a player owned server in the array.
        hostnames.splice(hostnameIndex, 1)                  // If found, remove it. 
    }
    for (let i = 0; i < hostnames.length; i++) {
        // Iterates the server list to get info about the targeted server.
        // Once that is done, target the server for rooting access and script copying.
        let serv = hostnames[i];
        let portsRequired = ns.getServerNumPortsRequired(serv);
        let serverLevel = ns.getServerSecurityLevel(serv);
        let hackingLevel = ns.getHackingLevel();
        let servRAM = ns.getServerMaxRam(serv);
        let backdoorCheck = ns.getServer(serv).backdoorInstalled
        var threadsNeeded = servRAM / scriptRAM;
        if (ns.hasRootAccess(serv) == false) {
            if (portsRequired == 0) {
                ns.nuke(serv)
                // Enable this once the player has BitNode-4
                // if (backdoorCheck == false) {
                //     ns.singularity.installBackdoor(serv)
                // }
                if (threadsNeeded != 0) {
                    await ns.scp(script, "home", serv)
                    ns.exec(script, serv, threadsNeeded)
                }
            }
            else if (portsAvailable >= portsRequired && portsAvailable != 5) {
                for (let j = 0; j < portsAvailable; j++) {
                    availablePortOpeningTools[j][1](serv)
                }
                ns.nuke(serv)
                // Enable this once the player has BitNode-4
                // if (backdoorCheck == false) {
                //     ns.singularity.installBackdoor(serv)
                // }
                if (threadsNeeded != 0) {
                    await ns.scp(script, "home", serv)
                    ns.exec(script, serv, threadsNeeded)
                }
            }
            else if (portsAvailable == 5) {
                ns.brutessh(serv)
                ns.ftpcrack(serv)
                ns.relaysmtp(serv)
                ns.httpworm(serv)
                ns.sqlinject(serv)
                ns.nuke(serv)
            }
            else {
                ns.tprint("You don't have enough port crackers to crack ", serv)
                ns.print("You don't have enough port crackers to crack ", serv)
            }
        }
        else {
            // Enable this once the player has BitNode-4
            // if (backdoorCheck == false) {
            //     ns.singularity.installBackdoor(serv)
            // }
            if (threadsNeeded != 0) {
                await ns.scp(script, "home", serv)
                ns.exec(script, serv, threadsNeeded)
            }
            else {
                ns.tprint(serv, " has been rooted, but the server has 0 GB of RAM")
                ns.print(serv, " has been rooted, but the server has 0 GB of RAM")
            }
        }
    }
    for (let k = 0; k < ownedServers.length; k++) {
        let listedOwnedServ = ownedServers[k];
        let servRAM = ns.getServerMaxRam(listedOwnedServ);
        let threadsNeeded = servRAM / scriptRAM;
        await ns.scp(script, "home", listedOwnedServ);
        ns.exec(script, listedOwnedServ, threadsNeeded)
    }
}
