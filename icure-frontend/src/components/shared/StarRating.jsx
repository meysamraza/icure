import { useState } from 'react';

const StarRating = ({ rating, setRating, interactive = true }) => {
    const [hover, setHover] = useState(0);

    return (
        <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
                <button
                    key={star}
                    type="button"
                    disabled={!interactive}
                    className={`text-2xl transition ${(hover || rating) >= star ? 'text-yellow-400' : 'text-gray-300'
                        } ${interactive ? 'cursor-pointer transform hover:scale-125' : 'cursor-default'}`}
                    onClick={() => interactive && setRating(star)}
                    onMouseEnter={() => interactive && setHover(star)}
                    onMouseLeave={() => interactive && setHover(0)}
                >
                    ★
                </button>
            ))}
        </div>
    );
};

export default StarRating;
