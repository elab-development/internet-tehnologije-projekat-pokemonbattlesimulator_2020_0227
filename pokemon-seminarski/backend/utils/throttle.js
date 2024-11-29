class Throttle {
    constructor(rateLimit = 1000) { // 1 request per second
        this.queue = [];
        this.rateLimit = rateLimit;
        this.isProcessing = false;
    }

    enqueue(fn) {
        return new Promise((resolve, reject) => {
            this.queue.push({ fn, resolve, reject });
            this.processQueue();
        });
    }

    async processQueue() {
        if (this.isProcessing) return;
        if (this.queue.length === 0) return;

        this.isProcessing = true;
        const { fn, resolve, reject } = this.queue.shift();

        try {
            const result = await fn();
            resolve(result);
        } catch (error) {
            reject(error);
        }

        setTimeout(() => {
            this.isProcessing = false;
            this.processQueue();
        }, this.rateLimit);
    }
}

module.exports = new Throttle(1000); // 1 second rate limit
