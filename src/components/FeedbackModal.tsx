import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Star } from "lucide-react";
import { useState } from "react";

interface FeedbackModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
}

const ratingLabels: Record<number, string> = {
  1: "Bad",
  2: "Okay",
  3: "Good",
  4: "Great",
  5: "Amazing",
};

export function FeedbackModal({ open, onClose, onSubmit }: FeedbackModalProps) {
  const [rating, setRating] = useState(0);
  const [description, setDescription] = useState("");

  const handleSubmit = () => {
    onSubmit({
      rating,
      description,
    });

    setRating(0);
    setDescription("");
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">
            Rate Your Experience ⭐
          </DialogTitle>
        </DialogHeader>

        {/* Star Rating */}
        <div className="flex flex-col items-center mt-6 gap-2">
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                onClick={() => setRating(star)}
                className={`cursor-pointer h-7 w-7 transition ${
                  star <= rating
                    ? "fill-yellow-400 text-yellow-400"
                    : "text-muted"
                }`}
              />
            ))}
          </div>

          {/* Rating Text */}
          {rating > 0 && (
            <span className="text-sm font-medium text-muted-foreground">
              ⭐ {rating} — {ratingLabels[rating]}
            </span>
          )}
        </div>

        {/* Description */}
        <Textarea
          placeholder="Share your feedback..."
          className="mt-6"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <Button
          className="w-full mt-4"
          onClick={handleSubmit}
          disabled={!rating}
        >
          Submit Feedback
        </Button>
      </DialogContent>
    </Dialog>
  );
}