import { Schema, model } from 'mongoose';

interface IStreamReport {
    title: string;
    status: string;
    streamId: string;
}

const streamReportSchema = new Schema<IStreamReport>(
    {
        title:  { type: String, required: true },
        status:    { type: String, required: true },
        streamId: { type: String, required: true }
    },
    { collection: 'stream_reports' } // Explicitly set the collection name
);

export const StreamReport = model<IStreamReport>('StreamReport', streamReportSchema);
