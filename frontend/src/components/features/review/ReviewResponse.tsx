import React, { useState } from 'react';
import { MessageSquare, X, Send } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { User } from '@/types';

interface ReviewResponseProps {
  reviewId: number;
  existingResponse?: string;
  onResponseSubmit: (reviewId: number, response: string) => Promise<void>;
  currentUserId?: number;
}

const ReviewResponse: React.FC<ReviewResponseProps> = ({
  reviewId,
  existingResponse,
  onResponseSubmit,
  currentUserId,
}) => {
  const [isResponding, setIsResponding] = useState(false);
  const [response, setResponse] = useState(existingResponse || '');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!response.trim()) return;

    try {
      setLoading(true);
      await onResponseSubmit(reviewId, response.trim());
      setIsResponding(false);
    } catch (error) {
      console.error('Failed to submit response:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setResponse(existingResponse || '');
    setIsResponding(false);
  };

  if (existingResponse && !isResponding) {
    return (
      <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-start gap-2">
          <MessageSquare className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-blue-900 mb-1">Seller Response</p>
            <p className="text-sm text-blue-800">{existingResponse}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!isResponding) {
    return (
      <div className="mt-3 text-right">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsResponding(true)}
          className="text-blue-600 border-blue-300 hover:bg-blue-50"
        >
          {existingResponse ? 'Edit Response' : 'Respond to Review'}
        </Button>
      </div>
    );
  }

  return (
    <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-sm font-semibold text-gray-900">
            {existingResponse ? 'Edit Response' : 'Add Response'}
          </label>
          <button
            type="button"
            onClick={handleCancel}
            className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Cancel response"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        
        <textarea
          value={response}
          onChange={(e) => setResponse(e.target.value)}
          placeholder="Thank you for your feedback. We appreciate your input and will address your concerns..."
          rows={3}
          maxLength={1000}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm"
          required
        />
        
        <div className="flex items-center justify-between">
          <p className="text-xs text-gray-500">
            {response.length}/1000 characters
          </p>
          
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleCancel}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={!response.trim() || loading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-2" />
                  Posting...
                </>
              ) : (
                <>
                  <Send className="w-3 h-3 mr-2" />
                  {existingResponse ? 'Update' : 'Post'} Response
                </>
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default ReviewResponse;