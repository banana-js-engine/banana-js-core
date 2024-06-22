export class Writer {
    static saveArrayAsJson(data: string, filename: string) {
        // Convert the array to a JSON string
        const jsonData = JSON.stringify(data, null, 2); // The second argument (null) is for replacer function, and the third (2) is for indentation
    
        // Create a Blob with the JSON data
        const blob = new Blob([jsonData], { type: 'application/json' });
    
        // Create a Blob URL
        const blobUrl = URL.createObjectURL(blob);
    
        // Create a download link
        const downloadLink = document.createElement('a');
        downloadLink.href = blobUrl;
        downloadLink.download = filename;
    
        // Trigger a click event to initiate the download
        downloadLink.click();
    
        // Clean up by revoking the Blob URL
        URL.revokeObjectURL(blobUrl);
    }

    static saveStringAsJson(data: string, filename: string) {
        // Create a Blob with the JSON data
        const blob = new Blob([data], { type: 'application/json' });
    
        // Create a Blob URL
        const blobUrl = URL.createObjectURL(blob);
    
        // Create a download link
        const downloadLink = document.createElement('a');
        downloadLink.href = blobUrl;
        downloadLink.download = filename;
    
        // Trigger a click event to initiate the download
        downloadLink.click();
    
        // Clean up by revoking the Blob URL
        URL.revokeObjectURL(blobUrl);
    }

    static saveStringAsFile(data: string, filename: string) {
        // Create a Blob with the string data
        const blob = new Blob([data], { type: 'text/plain' });
    
        // Create a Blob URL
        const blobUrl = URL.createObjectURL(blob);
    
        // Create a download link
        const downloadLink = document.createElement('a');
        downloadLink.href = blobUrl;
        downloadLink.download = filename;
    
        // Trigger a click event to initiate the download
        downloadLink.click();
    
        // Clean up by revoking the Blob URL
        URL.revokeObjectURL(blobUrl);
    }    
}

export class Reader {
    static readFileAsText() {
        return new Promise((resolve, reject) => {
            // Use showOpenFilePicker() asynchronously
            window.showOpenFilePicker()
                .then(fileHandle => {
                    // Get the first file handle
                    const handle = fileHandle[0];
    
                    // Get the file as a Blob
                    return handle.getFile();
                })
                .then(file => {
                    // Read the content of the file as text
                    const reader = new FileReader();
                    reader.onload = () => {
                        // Resolve with the file content
                        resolve(reader.result);
                    };
                    reader.onerror = () => {
                        // Reject with the error
                        reject(reader.error);
                    };
                    reader.readAsText(file);
                })
                .catch(error => {
                    // Reject with any errors
                    reject(error);
                });
        });
    }

    static selectPngFile() {
        return new Promise((resolve, reject) => {
            // Use showOpenFilePicker() asynchronously
            window.showOpenFilePicker({
                types: [{
                    description: 'PNG files',
                    accept: {
                        'image/png': ['.png']
                    }
                }],
                excludeAcceptAllOption: true,
                multiple: false
            })
            .then(fileHandle => {
                // Get the first file handle
                const handle = fileHandle[0];
        
                // Get the file as a Blob
                return handle.getFile();
            })
            .then(file => {
                if (file.type === "image/png") {
                    // Resolve with the file name
                    resolve(file.name);
                } else {
                    reject(new Error("Selected file is not a PNG."));
                }
            })
            .catch(error => {
                // Reject with any errors
                reject(error);
            });
        });
    }

    static selectAudioFile() {
        return new Promise((resolve, reject) => {
            // Use showOpenFilePicker() asynchronously
            window.showOpenFilePicker({
                types: [{
                    description: 'Audio files',
                    accept: {
                        'audio/mp3': ['.mp3'],
                        'audio/wav': ['.wav']
                    }
                }],
                excludeAcceptAllOption: true,
                multiple: false
            })
            .then(fileHandle => {
                // Get the first file handle
                const handle = fileHandle[0];
        
                // Get the file as a Blob
                return handle.getFile();
            })
            .then(file => {
                if (file.type === "audio/mpeg" || file.type === "audio/wav") {
                    // Resolve with the file name
                    resolve(file.name);
                } else {
                    reject(new Error("Selected file is not an MP3 or WAV file."));
                }
            })
            .catch(error => {
                // Reject with any errors
                reject(error);
            });
        });
    }
    
}