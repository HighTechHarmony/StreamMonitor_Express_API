import { Schema, model } from 'mongoose';


interface IStreamAlert {
    timestamp: string;    
    stream: string;
    alert: string;
    image: Buffer;
    streamId: string;
    
}

const streamAlertSchema = new Schema<IStreamAlert>(
    {
        timestamp:  { type: String, required: true },        
        stream:  { type: String, required: true },
        alert:    { type: String, required: true },
        image:    { type: Buffer, required: true },
        streamId: { type: String, required: false }
    },
    { collection: 'stream_alerts' } // Explicitly set the collection name
);

export const StreamAlert = model<IStreamAlert>('StreamAlert', streamAlertSchema);