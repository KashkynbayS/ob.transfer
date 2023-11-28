
export const addToFrequents = async (data: any): Promise<void> => {
    return new Promise((resolve, reject) => {
        try {
            const storedData = localStorage.getItem('frequents');
            const frequents = storedData ? JSON.parse(storedData) : [];
            frequents.unshift(data);
            localStorage.setItem('frequents', JSON.stringify(frequents));
    
            setTimeout(() => {
                resolve();
            }, 500);

        } catch (error) {
            reject(error);
        }
    });
  };
  