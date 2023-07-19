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
    let newData = [];
    let combinedData = [];
    if (fs.existsSync(pathToStoreSchwinger)) {
        const existingData = JSON.parse(fs.readFileSync(pathToStoreSchwinger, 'utf8'));
        const existingIds = new Set(existingData.map(obj => obj.id));
        newData = transformedSchwinger.filter(obj => !existingIds.has(obj.id));
        combinedData = [...existingData, ...newData];
        fs.writeFileSync(
            config.path,
            JSON.stringify(combinedData, null, 2),
            (err) => {
                if (err) throw err;
            },
        );
    } else {
        newData = transformedSchwinger;
        fs.writeFileSync(
            config.path,
            JSON.stringify(newData, null, 2),
            (err) => {
                if (err) throw err;
            },
        );
    }

    return {
        success: true,
        location: pathToStoreSchwinger,
        numberOfRecordsAdded: newData.length,
        totalNumberOfRecords: combinedData.length
    }
}
