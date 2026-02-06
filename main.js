
// ... (existing code) ...

    startBtn.addEventListener('click', () => {
        status.textContent = 'Recognizing text...';
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        const image = new Image();
        image.onload = () => {
            canvas.width = image.width;
            canvas.height = image.height;
            context.drawImage(image, 0, 0);
            let imageData = context.getImageData(0, 0, canvas.width, canvas.height);
            imageData = toGrayscale(imageData);
            const averageBrightness = getAverageBrightness(imageData);
            imageData = threshold(imageData, averageBrightness);
            context.putImageData(imageData, 0, 0);
            Tesseract.recognize(
                canvas,
                'eng',
                {
                    logger: m => console.log(m),
                    tessedit_char_whitelist: 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ',
                }
            ).then(({ data: { text } }) => {
                words = text.split(/\s+/).filter(word => word.length > 1);
                status.textContent = 'Text recognized!';
                displayWordConfirmation(words);
            });
        };
        image.src = capturedImage.src;
    });

// ... (existing code) ...

    // --- Image Preprocessing ---
    function toGrayscale(imageData) {
        const data = imageData.data;
        for (let i = 0; i < data.length; i += 4) {
            const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
            data[i] = avg; // red
            data[i + 1] = avg; // green
            data[i + 2] = avg; // blue
        }
        return imageData;
    }

    function getAverageBrightness(imageData) {
        const data = imageData.data;
        let sum = 0;
        for (let i = 0; i < data.length; i += 4) {
            sum += (data[i] + data[i + 1] + data[i + 2]) / 3;
        }
        return sum / (data.length / 4);
    }

    function threshold(imageData, thresholdValue) {
        const data = imageData.data;
        for (let i = 0; i < data.length; i += 4) {
            const brightness = (data[i] + data[i + 1] + data[i + 2]) / 3;
            const value = brightness > thresholdValue ? 255 : 0;
            data[i] = value; // red
            data[i + 1] = value; // green
            data[i + 2] = value; // blue
        }
        return imageData;
    }

// ... (existing code) ...
