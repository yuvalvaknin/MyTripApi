import fs from 'fs';
import path from 'path';

export const createPhotoDirectory = (directoryPath : string) => {
    const PhotoDir = path.join(directoryPath, 'photos');

    if (!fs.existsSync(PhotoDir)) {
    fs.mkdirSync(PhotoDir);
    }
    return PhotoDir;
}

export const attachPhoto = (directoryPath : string, id : string) => {
    const filePath = path.join(directoryPath, id);
    if (fs.existsSync(filePath)) {
        return fs.readFileSync(filePath, 'utf-8');
    }
}

export const addPhoto = (directoryPath : string, id : string, photo : string) => {
    const filePath = path.join(directoryPath, id);
    fs.writeFileSync(filePath, photo);
}

export const deletePhoto = (directoryPath : string, id : string) => {
    const filePath = path.join(directoryPath, id);
    if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
    }
}