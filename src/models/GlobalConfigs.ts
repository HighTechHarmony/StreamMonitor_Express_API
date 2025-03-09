import { Schema, model } from 'mongoose';

interface IglobalConfigs {
    global_configs: string;
    restart_due: string;    
}

const globalConfigsSchema = new Schema<IglobalConfigs>(
    {
        global_configs:  { type: String, required: true },
        restart_due:    { type: String, required: true },        
    },
    { collection: 'global_configs' } // Explicitly set the collection name
);

export const globalConfigs = model<IglobalConfigs>('globalConfigs', globalConfigsSchema);