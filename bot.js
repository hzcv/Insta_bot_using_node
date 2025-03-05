const IgApiClient = require('instagram-private-api').IgApiClient;
const { readFileSync } = require('fs');
const readline = require('readline-sync');

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

    // Generate iPhone device configuration
    client.state.generateDevice(username);
    // Override with iPhone parameters
    client.state.device = {
        ...client.state.device,
        userAgent: 'Instagram 277.0.0.19.286 iOS (15_6_1; iPhone13,2; en_US; en-US; scale=3.00; 1170x2532; 386531449)',
        deviceString: 'iOS 16_6', 
        deviceModel: 'iPhone14,2',
        phoneManufacturer: 'Apple',
        deviceType: 'iOS-16.6-iPhone14,2--465573253',
        buildNumber: '26.1.0.13.119'
    };

    try {
        await client.account.login(username, password);
        console.log("\nInstagram login successful!\n");
        return client;
    } catch (e) {
        console.error("Login failed:", e);
        process.exit(1);
    }
}


async function sendInboxMessage(client, targetUsername, messages, haterName, delayMs) {
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
        await sendInboxMessage(client, target, messages, haterName, delaySeconds);
    } else if (choice === 'group') {
        const threadId = readline.question("Group thread ID: ").trim();
        await sendGroupMessage(client, threadId, messages, haterName, delaySeconds);
    } else {
        console.error("Invalid choice!");
    }
}

main().catch(console.error);
