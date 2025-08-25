import quiz1 from '../assets/quiz1.jpeg';
import quiz2 from '../assets/quiz2.jpeg';
import quiz3 from '../assets/quiz3.jpeg';
import quiz4 from '../assets/quiz4.jpeg';
import quiz5 from '../assets/quiz5.jpeg';
import quiz6 from '../assets/quiz6.jpeg';
import quiz7 from '../assets/quiz7.jpeg';
import quiz8 from '../assets/quiz8.jpeg';

import class1 from '../assets/class1.jpeg';
import class2 from '../assets/class2.jpeg';
import class3 from '../assets/class3.jpeg';
import class4 from '../assets/class4.jpeg';
import class5 from '../assets/class5.jpeg';
import class6 from '../assets/class6.jpeg';

const getRandomImage = (type) => {
    const quizImages = [quiz1, quiz2, quiz3, quiz4, quiz5, quiz6, quiz7, quiz8];
    const classImages = [class1, class2, class3, class4, class5, class6];

    if(type === 'quiz'){
        const randomIndex = Math.floor(Math.random() * quizImages.length);
        return quizImages[randomIndex];
    }

    if(type === 'class'){
        const randomIndex = Math.floor(Math.random() * classImages.length);
        return classImages[randomIndex];
    }
};

export default getRandomImage;