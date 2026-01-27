const setExecutorOnMessage = (executor, onMessage) => { 
    let buffer = '';

    executor.on('data', (chunk) => {
        buffer += chunk.toString();

        while (true) {
            const idx = buffer.indexOf('\n');
            if (idx === -1) break;

            const line = buffer.slice(0, idx);

            const message = JSON.parse(line);

            onMessage(message)

            buffer = buffer.slice(idx + 1);
            if (!line) continue;
        }
        // Don't close the connection - keep it open for more messages
    });
}

const requestCodeExecution = (executor, message) => {
    const payload = JSON.stringify(message) + '\n';
    executor.write(payload);
}

export { setExecutorOnMessage, requestCodeExecution };
