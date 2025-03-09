import { Schema, model } from 'mongoose';

interface IStreamImage {
    stream: string;
    data: string;
    timestamp: string;
    streamId: string;    
}

const streamImageSchema = new Schema<IStreamImage>(
    {
        stream:  { type: String, required: true },
        data:    { type: String, required: true },
        timestamp:  { type: String, required: true },
        streamId: { type: String, required: false }
    },
    { collection: 'stream_images' } // Explicitly set the collection name
);

export const StreamImage = model<IStreamImage>('StreamImage', streamImageSchema);