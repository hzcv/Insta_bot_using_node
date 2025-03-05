const IgApiClient = require('instagram-private-api').IgApiClient;
const { readFileSync } = require('fs');
const readline = require('readline-sync');

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function instagramLogin(username, password) {
    const client = new IgApiClient();
    
    // iPhone 14 Pro device configuration
    client.state.generateDevice(username);
    client.state.device = {
        ...client.state.device,
        userAgent: 'Instagram 277.0.0.19.286 iOS (16_6_1; iPhone14,2; en_US; en-US; scale=3.00; 1170x2532; 463678449)',
        deviceString: 'iOS 16_6',
        deviceModel: 'iPhone14,2',
        phoneManufacturer: 'Apple',
        deviceType: 'iOS-16.6-iPhone14,2--465573253',
        buildNumber: '26.1.0.13.119'
    };

    try {
        await client.simulate.postLoginFlow();
        await client.account.login(username, password);
        console.log("\n✅ Login successful!\n");
        return client;
    } catch (e) {
        console.error("❌ Login failed:", e);
        process.exit(1);
    }
}

async function sendInboxMessage(client, targetUsername, messages, haterName, delayMs) {
    try {
        const userId = await client.user.getIdByUsername(targetUsername);
        const thread = client.entity.directThread([userId.toString()]);
        
        console.log(`\n🚀 Starting message loop to ${targetUsername}`);
        while (true) {
            for (const message of messages) {
                const finalMessage = `${haterName} : ${message}`;
                await thread.broadcastText(finalMessage);
                console.log(`📩 Sent: ${finalMessage}`);
                await delay(delayMs);
            }
        }
    } catch (e) {
        console.error("💥 Message error:", e);
        process.exit(1);
    }
}

async function sendGroupMessage(client, threadId, messages, haterName, delayMs) {
    try {
        const thread = client.entity.directThread(threadId);
        
        console.log(`\n🚀 Starting group message loop in thread ${threadId}`);
        while (true) {
            for (const message of messages) {
                const finalMessage = `${haterName} : ${message}`;
                await thread.broadcastText(finalMessage);
                console.log(`📩 Sent: ${finalMessage}`);
                await delay(delayMs);
            }
        }
    } catch (e) {
        console.error("💥 Group message error:", e);
        process.exit(1);
    }
}

async function main() {
    try {
        console.log("📱 Instagram Message Bot - iPhone Emulation\n");
        
        // Get credentials
        const username = readline.question("Enter your Instagram username: ");
        const password = readline.question("Enter your Instagram password: ", { hideEchoBack: true });
        
        // Login
        const client = await instagramLogin(username, password);
        
        // Get configuration
        const choice = readline.question("Send to (1) Inbox or (2) Group? [1/2]: ");
        const haterName = readline.question("Hater's display name: ");
        const msgFilePath = readline.question("Message file path: ");
        const delayMs = parseInt(readline.question("Delay between messages (milliseconds): "));

        // Read messages
        let messages;
        try {
            messages = readFileSync(msgFilePath, 'utf8')
                .split('\n')
                .filter(line => line.trim());
        } catch (e) {
            console.error("❌ File error:", e);
            process.exit(1);
        }

        // Start appropriate sender
        if (choice === '1') {
            const target = readline.question("Target username: ");
            await sendInboxMessage(client, target, messages, haterName, delayMs);
        } else if (choice === '2') {
            const threadId = readline.question("Group thread ID: ");
            await sendGroupMessage(client, threadId, messages, haterName, delayMs);
        } else {
            console.log("❌ Invalid choice!");
            process.exit(1);
        }
    } catch (e) {
        console.error("💥 Critical error:", e);
        process.exit(1);
    }
}

// Start the bot
main();
