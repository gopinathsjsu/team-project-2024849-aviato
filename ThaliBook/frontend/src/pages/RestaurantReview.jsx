import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { format } from 'date-fns';
import axios from 'axios';
import { useAuth } from '@/hooks/useAuth';

const RATING_LABELS = ['Terrible', 'Bad', 'Okay', 'Good', 'Excellent'];
const EMOJI_MAP = {
  1: '😡',
  2: '😞',
  3: '😐',
  4: '😊',
  5: '🤩',
};

export default function RestaurantReview({ restaurantId }) {
  const [reviews, setReviews] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [newRating, setNewRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [alreadyReviewed, setAlreadyReviewed] = useState(false);

  const { token, user } = useSelector(state => state.auth);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    fetchReviews();
  }, [restaurantId]);

  const fetchReviews = async () => {
    try {
      const res = await axios.get(
        `http://localhost:8080/api/reviews/restaurant/${restaurantId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setReviews(res.data);

      if (user) {
        const userReviewExists = res.data.some(
          (review) => review.userId === user.userId
        );
        setAlreadyReviewed(userReviewExists);
      }
    } catch (err) {
      console.error('Failed to fetch reviews:', err);
    }
  };

  const handleReviewSubmit = async () => {
    if (!newComment.trim() || newRating === 0) return;
    setSubmitting(true);
    setErrorMessage('');

    try {
      await axios.post(
        'http://localhost:8080/api/reviews',
        {
          restaurantId,
          userId: user.userId,
          rating: newRating,
          comment: newComment.trim(),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setNewComment('');
      setNewRating(0);
      setHoverRating(0);
      fetchReviews();
    } catch (err) {
      if (err.response?.status === 403) {
        setAlreadyReviewed(true);
        setErrorMessage("You've already submitted a review for this restaurant.");
      } else {
        console.error('Error posting review:', err);
        setErrorMessage('Something went wrong. Please try again later.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mb-8">
      <h2 className="text-xl font-bold mb-4">Reviews</h2>

      {reviews.length === 0 ? (
        <p className="text-gray-500">No reviews yet. Be the first to review!</p>
      ) : (
        <div className="space-y-4 mb-6">
          {reviews.map((review) => {
            const rawName = review.userEmail?.split('@')[0] || 'anonymous';
            const displayName = rawName.charAt(0).toUpperCase() + rawName.slice(1);
            return (
              <div
                key={review.reviewId}
                className="border border-gray-100 rounded-lg p-5 shadow-sm bg-gray-50 hover:shadow-md transition"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-800">{displayName}</span>
                    <span className="text-xl">{EMOJI_MAP[review.rating]}</span>
                  </div>
                  <div className="flex items-center gap-0.5">
                    {Array(5)
                      .fill()
                      .map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < review.rating ? 'text-yellow-400' : 'text-gray-300'
                          }`}
                          fill={i < review.rating ? 'currentColor' : 'none'}
                        />
                      ))}
                  </div>
                </div>
                <p className="text-sm text-gray-700 mb-1">{review.comment}</p>
                <p className="text-xs text-gray-400">
                  {format(new Date(review.createdAt), 'PPPpp')}
                </p>
              </div>
            );
          })}
        </div>
      )}

      {isAuthenticated && !alreadyReviewed && (
        <div className="pt-6 border-t border-gray-200">
          <h3 className="text-lg font-semibold mb-2">Add Your Review</h3>
          <div className="space-y-3">
            {/* ⭐ Star Rating with Hover + Tooltip + Reset */}
            <div>
              <label className="block mb-1 text-sm font-medium">Rating</label>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <div key={star} className="relative group">
                    <Star
                      className={`h-6 w-6 cursor-pointer transition-colors ${
                        (hoverRating || newRating) >= star
                          ? 'text-yellow-400'
                          : 'text-gray-300'
                      }`}
                      fill={(hoverRating || newRating) >= star ? 'currentColor' : 'none'}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() =>
                        setNewRating((prev) => (prev === star ? 0 : star))
                      }
                    />
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 scale-0 group-hover:scale-100 bg-black text-white text-xs px-2 py-1 rounded transition-transform z-10">
                      {RATING_LABELS[star - 1]}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 📝 Comment Input */}
            <div>
              <label className="block mb-1 text-sm font-medium">Comment</label>
              <Textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="What did you like or dislike?"
                rows={4}
              />
            </div>

            {errorMessage && (
              <p className="text-sm text-red-500">{errorMessage}</p>
            )}

            <Button
              className="bg-orange-600 hover:bg-orange-700 text-white"
              onClick={handleReviewSubmit}
              disabled={submitting}
            >
              {submitting ? 'Submitting...' : 'Add Review'}
            </Button>
          </div>
        </div>
      )}

      {isAuthenticated && alreadyReviewed && (
        <div className="mt-6 text-sm text-gray-600 italic">
          You’ve already submitted a review for this restaurant.
        </div>
      )}
    </div>
  );
}
