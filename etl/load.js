import fs from "fs";
import path from "path";

export function loadSchwingerToFile(transformedSchwinger, config) {
    if (!Array.isArray(transformedSchwinger)) {
        throw new Error('input must be an array');
    }
    if (transformedSchwinger.length === 0) {
        return {
            success: true,
            numberOfRecords: 0
        }
    }

    const pathToStoreSchwinger = path.join(process.cwd(), config.path);
    if (fs.existsSync(pathToStoreSchwinger)) {
        const existingData = JSON.parse(fs.readFileSync(pathToStoreSchwinger, 'utf8'));
        const combinedData = [...existingData, ...transformedSchwinger];
        fs.writeFileSync(
            config.path,
            JSON.stringify(combinedData, null, 2),
            (err) => {
                if (err) throw err;
            },
        );
    } else {
        fs.writeFileSync(
            config.path,
            JSON.stringify(transformedSchwinger, null, 2),
            (err) => {
                if (err) throw err;
            },
        );
    }

    return {
        success: true,
        numberOfRecords: transformedSchwinger.length
    }
}
