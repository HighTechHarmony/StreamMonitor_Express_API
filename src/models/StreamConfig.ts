import { Schema, model } from 'mongoose';

interface IStreamConfig {
    title: string;
    uri: string;
    audio: string;
    enabled: string;
    streamId: string;
}

const streamConfigSchema = new Schema<IStreamConfig>(
    {
        title:  { type: String, required: true },
        uri:    { type: String, required: true },
        audio:  { type: String, required: true },
        enabled:{ type: String, required: true },
        streamId: { type: String, required: true }
    },
    { collection: 'stream_configs' } // Explicitly set the collection name
);

export const StreamConfig = model<IStreamConfig>('StreamConfig', streamConfigSchema);