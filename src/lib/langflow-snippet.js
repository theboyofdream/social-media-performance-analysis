class LangflowClient {
    constructor(baseURL, applicationToken) {
        this.baseURL = baseURL;
        this.applicationToken = applicationToken;
    }
    async post(endpoint, body, headers = { "Content-Type": "application/json" }) {
        headers["Authorization"] = `Bearer ${this.applicationToken}`;
        headers["Content-Type"] = "application/json";
        const url = `${this.baseURL}${endpoint}`;
        try {
            const response = await fetch(url, {
                method: "POST",
                headers: headers,
                body: JSON.stringify(body),
            });

            const responseMessage = await response.json();
            if (!response.ok) {
                throw new Error(
                    `${response.status} ${response.statusText} - ${JSON.stringify(
                        responseMessage
                    )}`
                );
            }
            return responseMessage;
        } catch (error) {
            console.error("Request Error:", error.message);
            throw error;
        }
    }

    async initiateSession(
        flowId,
        langflowId,
        inputValue,
        inputType = "chat",
        outputType = "chat",
        stream = false,
        tweaks = {}
    ) {
        const endpoint = `/lf/${langflowId}/api/v1/run/${flowId}?stream=${stream}`;
        return this.post(endpoint, {
            input_value: inputValue,
            input_type: inputType,
            output_type: outputType,
            tweaks: tweaks,
        });
    }

    handleStream(streamUrl, onUpdate, onClose, onError) {
        const eventSource = new EventSource(streamUrl);

        eventSource.onmessage = (event) => {
            const data = JSON.parse(event.data);
            onUpdate(data);
        };

        eventSource.onerror = (event) => {
            console.error("Stream Error:", event);
            onError(event);
            eventSource.close();
        };

        eventSource.addEventListener("close", () => {
            onClose("Stream closed");
            eventSource.close();
        });

        return eventSource;
    }

    async runFlow(
        flowIdOrName,
        langflowId,
        inputValue,
        inputType = "chat",
        outputType = "chat",
        tweaks = {},
        stream = false,
        onUpdate,
        onClose,
        onError
    ) {
        try {
            const initResponse = await this.initiateSession(
                flowIdOrName,
                langflowId,
                inputValue,
                inputType,
                outputType,
                stream,
                tweaks
            );
            console.log("Init Response:", initResponse);
            if (
                stream &&
                initResponse &&
                initResponse.outputs &&
                initResponse.outputs[0].outputs[0].artifacts.stream_url
            ) {
                const streamUrl =
                    initResponse.outputs[0].outputs[0].artifacts.stream_url;
                console.log(`Streaming from: ${streamUrl}`);
                this.handleStream(streamUrl, onUpdate, onClose, onError);
            }
            return initResponse;
        } catch (error) {
            console.error("Error running flow:", error);
            onError("Error initiating session");
        }
    }
}

const langflowClient = new LangflowClient(
    "https://api.langflow.astra.datastax.com",
    process.env.LANGFLOW_APP_TOKEN
)

export async function execLangFlow(
    inputValue,
    inputType = "chat",
    outputType = "chat",
    stream = false
) {
    const flowIdOrName = process.env.FLOW_ID_OR_NAME;
    const langflowId = process.env.LANG_FLOW_ID;

    try {
        const tweaks = {
            "ChatInput-lWxnA": {},
            "ParseData-hfeiU": {},
            "Prompt-EMqmU": {},
            "SplitText-pd5bq": {},
            "ChatOutput-Y95k3": {},
            "AstraDB-6Kawm": {},
            "AstraDB-LSs4P": {},
            "File-B2k4d": {},
            "Google Generative AI Embeddings-Q4OBf": {},
            "Google Generative AI Embeddings-wG5I7": {},
            "GoogleGenerativeAIModel-ZO3wS": {},
        };
        let response = await langflowClient.runFlow(
            flowIdOrName,
            langflowId,
            inputValue,
            inputType,
            outputType,
            tweaks,
            stream,
            (data) => console.log("Received:", data.chunk), // onUpdate
            (message) => console.log("Stream Closed:", message), // onClose
            (error) => console.log("Stream Error:", error) // onError
        );
        if (!stream && response && response.outputs) {
            const flowOutputs = response.outputs[0];
            const firstComponentOutputs = flowOutputs.outputs[0];
            const output = firstComponentOutputs.outputs.message;

            console.log("Final Output:", output.message.text);
            return output.message.text
        }
    } catch (error) {
        console.error("Main Error", error.message);
        return `Oops! Something went wrong.`
    }
}

