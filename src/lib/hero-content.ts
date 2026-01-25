export const HERO_PLACEHOLDERS = [
    "What are you in the mood to track?",
    "Should we update your watch history?",
    "What did you watch recently?",
    "Stream Track is the best tracking site ever!",
    "What's on your watchlist today?",
    "How was your day? Tracked any movies?",
    "Forgot to track a movie?",
    "Isn't Stream Track just the best?",
    "Isn't tracking your shows fun?",
    ">ᴗ<",
];

export const HERO_TITLES = {
    day: {
        default: "What would you like to track this afternoon?",
        extra: ["Viva la Stream Track!"],
    },
    morning: {
        default: "What would you like to track this morning?",
        extra: ["Viva la Stream Track!"],
    },
    night: {
        default: "What would you like to track tonight?",
        extra: ["Up for something spicy?"],
    },
    "420": {
        default: "What would you like to track this 4/20?",
        extra: ["Happy 4/20 🥳!"],
    },
    "69": {
        default: "Up for something spicy?",
        extra: ["Happy 6/9! 😘"],
    },
    halloween: {
        default: "What spooky movie did you track on Halloween?",
        extra: [
            "Happy Halloween! 🎃👻",
            "Boo! 👻",
            "Trick or treat! 🍬",
            "It's the Great Pumpkin, Charlie Brown!",
        ],
    },
};

export function getHeroContent() {
    const now = new Date();
    const month = now.getMonth() + 1; // 1-12
    const day = now.getDate();
    const hour = now.getHours();

    // Special Dates
    if (month === 4 && day === 20) return getContent("420");
    if (month === 6 && day === 9) return getContent("69");
    if (month === 10 && day === 31) return getContent("halloween");

    // Time of Day
    if (hour >= 5 && hour < 12) return getContent("morning");
    if (hour >= 12 && hour < 18) return getContent("day");
    return getContent("night");
}

function getContent(key: keyof typeof HERO_TITLES) {
    const group = HERO_TITLES[key];
    // 30% chance to show extra title, otherwise default
    // Adjust probability as needed
    const showExtra = Math.random() < 0.3;

    let title = group.default;
    if (showExtra && group.extra.length > 0) {
        const randomIndex = Math.floor(Math.random() * group.extra.length);
        title = group.extra[randomIndex];
    }

    return { title };
}

export function getRandomPlaceholder() {
    const randomIndex = Math.floor(Math.random() * HERO_PLACEHOLDERS.length);
    return HERO_PLACEHOLDERS[randomIndex];
}
