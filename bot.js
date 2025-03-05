const IgApiClient = require('instagram-private-api').IgApiClient;
const { readFileSync } = require('fs');
const readline = require('readline-sync');

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function instagramLogin(username, password) {
    const client = new IgApiClient();
    client.state.generateDevice(username);
    try {
        await client.account.login(username, password);
        console.log("\nInstagram login successful!\n");
        return client;
    } catch (e) {
        console.error("Login failed:", e);
        process.exit(1);
    }
}

async function sendInboxMessage(client, targetUsername, messages, haterName, delayMS) {
    try {
        const userId = await client.user.getIdByUsername(targetUsername);
        const thread = client.entity.directThread([userId.toString()]);
        while (true) {
            for (const message of messages) {
                const finalMessage = `${haterName} : ${message}`;
                await thread.broadcastText(finalMessage);
                console.log(`Message sent: ${finalMessage}`);
                await delay(delayMs);
            }
        }
    } catch (e) {
        console.error("Error sending message:", e);
    }
}

async function sendGroupMessage(client, threadId, messages, haterName, delayMs) {
    try {
        const thread = client.entity.directThread(threadId);
        while (true) {
            for (const message of messages) {
                const finalMessage = `${haterName} : ${message}`;
                await thread.broadcastText(finalMessage);
                console.log(`Group message sent: ${finalMessage}`);
                await delay(delayMs);
            }
        }
    } catch (e) {
        console.error("Error sending group message:", e);
    }
}

async function main() {
    const username = readline.question("Enter your Instagram username: ");
    const password = readline.question("Enter your Instagram password: ", { hideEchoBack: true });
    
    const client = await instagramLogin(username, password);
    
    const choice = readline.question("Send to inbox or group? (inbox/group): ").toLowerCase();
    const haterName = readline.question("Enter hater's name: ").trim();
    const msgFilePath = readline.question("Path to message file: ");
    const delayMs = parseInt(readline.question("Delay between messages (MILLISECONDS): "));

    let messages;
    try {
        messages = readFileSync(msgFilePath, 'utf8')
            .split('\n')
            .map(line => line.trim())
            .filter(line => line);
    } catch (e) {
        console.error("Error reading file:", e);
        return;
    }

    if (choice === 'inbox') {
        const target = readline.question("Target username: ");
        await sendInboxMessage(client, target, messages, haterName, delayMs);
    } else if (choice === 'group') {
        const threadId = readline.question("Group thread ID: ").trim();
        await sendGroupMessage(client, threadId, messages, haterName, delayMs);
    } else {
        console.error("Invalid choice!");
    }
}

main().catch(console.error);
