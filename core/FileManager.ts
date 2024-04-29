export class Writer {
    static saveArrayAsJson(data, filename) {
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

    static saveStringAsJson(data, filename) {
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
}

export class Reader {
    static loadDataFromJson(file) {
        const reader = new FileReader();

        reader.readAsText(file);

        reader.onload = (e) => {
            const fileContents = e.target.result;

            return JSON.parse(fileContents.toString());
        }
    }
}