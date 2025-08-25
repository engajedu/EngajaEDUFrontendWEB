const getRandomColor = () => {
    const colors = ['#E57373', '#64B5F6', '#81C784', '#FFF176'];
    const randomIndex = Math.floor(Math.random() * colors.length);
    return colors[randomIndex];
};

export default getRandomColor;