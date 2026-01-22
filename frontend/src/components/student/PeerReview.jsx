import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Star } from 'lucide-react';

const PeerReview = ({ submissionId, submissionType, onSubmit }) => {
  const [review, setReview] = useState({
    review_content: '',
    rating: 0,
    is_anonymous: true
  });

  const handleSubmit = async () => {
    await fetch('/api/peer-review', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        submission_id: submissionId,
        submission_type: submissionType,
        ...review
      })
    });
    onSubmit();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Peer Review</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map(star => (
            <Star
              key={star}
              className={`w-6 h-6 cursor-pointer ${star <= review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
              onClick={() => setReview({ ...review, rating: star })}
            />
          ))}
        </div>

        <Textarea
          placeholder="Write your review..."
          value={review.review_content}
          onChange={(e) => setReview({ ...review, review_content: e.target.value })}
          rows={5}
        />

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={review.is_anonymous}
            onChange={(e) => setReview({ ...review, is_anonymous: e.target.checked })}
          />
          <span className="text-sm">Submit anonymously</span>
        </label>

        <Button onClick={handleSubmit}>Submit Review</Button>
      </CardContent>
    </Card>
  );
};

export default PeerReview;
