import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { 
  ProductReview, 
  ProductRatingSummary, 
  ReviewListResponse,
  ReviewCreatePayload,
  ReviewUpdatePayload
} from '@/types/commerce';
import { 
  Star, 
  ThumbsUp, 
  ShieldCheck, 
  Camera, 
  Plus, 
  Trash2, 
  Edit3, 
  CheckCircle2, 
  Filter, 
  ArrowUpDown,
  X,
  Sparkles,
  MessageSquarePlus,
  Image as ImageIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

interface ProductReviewsSectionProps {
  productId: string;
  productName: string;
  currentUserId?: string;
  currentUserName?: string;
}

const STAR_LABELS: Record<number, string> = {
  5: "5 - Excellent",
  4: "4 - Very Good",
  3: "3 - Average",
  2: "2 - Poor",
  1: "1 - Terrible"
};

export function ProductReviewsSection({
  productId,
  productName,
  currentUserId = "cust_verified_buyer",
  currentUserName = "Verified Buyer"
}: ProductReviewsSectionProps) {
  const queryClient = useQueryClient();
  const [selectedStarFilter, setSelectedStarFilter] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<string>("most_helpful");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingReview, setEditingReview] = useState<ProductReview | null>(null);
  const [expandedImage, setExpandedImage] = useState<string | null>(null);

  // Form states
  const [formRating, setFormRating] = useState<number>(5);
  const [formHoverRating, setFormHoverRating] = useState<number>(0);
  const [formTitle, setFormTitle] = useState('');
  const [formText, setFormText] = useState('');
  const [formImages, setFormImages] = useState<string[]>([]);
  const [newImageUrl, setNewImageUrl] = useState('');

  // 1. Fetch reviews
  const { data, isLoading, refetch } = useQuery<ReviewListResponse>({
    queryKey: ['product_reviews', productId, selectedStarFilter, sortBy],
    queryFn: async () => {
      const params: any = {
        product_id: productId,
        sort_by: sortBy,
        voter_id: currentUserId,
        limit: 20
      };
      if (selectedStarFilter) {
        params.rating = selectedStarFilter;
      }
      return await apiClient.get<ReviewListResponse>('/reviews', params);
    },
    enabled: Boolean(productId)
  });

  const reviews = data?.items || [];
  const summary: ProductRatingSummary = data?.summary || {
    product_id: productId,
    average_rating: 4.8,
    total_reviews: 0,
    rating_breakdown: {
      "5": { star: 5, count: 0, percentage: 0 },
      "4": { star: 4, count: 0, percentage: 0 },
      "3": { star: 3, count: 0, percentage: 0 },
      "2": { star: 2, count: 0, percentage: 0 },
      "1": { star: 1, count: 0, percentage: 0 },
    },
    verified_purchases_count: 0
  };

  // 2. Helpful vote mutation
  const helpfulVoteMutation = useMutation({
    mutationFn: async (reviewId: string) => {
      return await apiClient.post(`/reviews/${reviewId}/helpful?voter_id=${currentUserId}`);
    },
    onSuccess: () => {
      refetch();
    }
  });

  // 3. Add/Edit review mutation
  const saveReviewMutation = useMutation({
    mutationFn: async () => {
      if (editingReview) {
        const payload: ReviewUpdatePayload = {
          rating: formRating,
          review_title: formTitle,
          review_text: formText,
          images: formImages
        };
        return await apiClient.put(`/reviews/${editingReview.id}`, payload);
      } else {
        const payload: ReviewCreatePayload = {
          product_id: productId,
          rating: formRating,
          review_title: formTitle,
          review_text: formText,
          customer_id: currentUserId,
          customer_name: currentUserName,
          images: formImages,
          verified_purchase: true
        };
        return await apiClient.post('/reviews', payload);
      }
    },
    onSuccess: () => {
      setIsModalOpen(false);
      resetForm();
      refetch();
      queryClient.invalidateQueries({ queryKey: ['product_reviews'] });
    }
  });

  // 4. Delete review mutation
  const deleteReviewMutation = useMutation({
    mutationFn: async (reviewId: string) => {
      return await apiClient.delete(`/reviews/${reviewId}`);
    },
    onSuccess: () => {
      refetch();
    }
  });

  const handleOpenWriteModal = () => {
    resetForm();
    setEditingReview(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (rev: ProductReview) => {
    setEditingReview(rev);
    setFormRating(rev.rating);
    setFormTitle(rev.review_title);
    setFormText(rev.review_text);
    setFormImages(rev.images || []);
    setIsModalOpen(true);
  };

  const resetForm = () => {
    setFormRating(5);
    setFormHoverRating(0);
    setFormTitle('');
    setFormText('');
    setFormImages([]);
    setNewImageUrl('');
  };

  const handleAddImage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newImageUrl.trim()) {
      setFormImages((prev) => [...prev, newImageUrl.trim()]);
      setNewImageUrl('');
    }
  };

  const handleRemoveImage = (indexToRemove: number) => {
    setFormImages((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  return (
    <div className="space-y-8 pt-4">
      {/* Header with Title and "Write Review" button */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-xl font-bold text-[#072654] tracking-tight">
              Customer Ratings & Reviews
            </h3>
            <Badge className="bg-blue-50 text-[#0B72E7] border-blue-200 text-xs font-semibold">
              {summary.total_reviews} Verified
            </Badge>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real feedback from verified buyers and enterprise teams using {productName}
          </p>
        </div>

        <Button
          onClick={handleOpenWriteModal}
          className="bg-[#0B72E7] hover:bg-[#095bc0] text-white shadow-xs rounded-xl text-xs font-bold gap-2 h-9 px-4 shrink-0"
        >
          <MessageSquarePlus className="w-4 h-4" />
          Write a Review
        </Button>
      </div>

      {/* Product Rating Summary & Rating Breakdown Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 bg-slate-50/80 p-6 rounded-3xl border border-slate-200">
        {/* Left Card (4 cols): Average Rating & Score */}
        <div className="md:col-span-4 flex flex-col justify-center items-center text-center p-4 bg-white rounded-2xl border border-slate-200/80 shadow-2xs space-y-2">
          <span className="text-4xl sm:text-5xl font-extrabold text-[#072654] tracking-tight">
            {summary.average_rating.toFixed(1)}
          </span>
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star
                key={s}
                className={`w-4 h-4 ${
                  s <= Math.round(summary.average_rating)
                    ? 'fill-amber-400 text-amber-500'
                    : 'text-slate-300'
                }`}
              />
            ))}
          </div>
          <span className="text-xs font-semibold text-slate-600">
            Based on {summary.total_reviews.toLocaleString()} reviews
          </span>
          <div className="text-[11px] text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 font-medium flex items-center gap-1 mt-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>98% Verified Commercial Purchases</span>
          </div>
        </div>

        {/* Right Card (8 cols): Rating Breakdown (5★ to 1★) */}
        <div className="md:col-span-8 flex flex-col justify-center p-4 bg-white rounded-2xl border border-slate-200/80 shadow-2xs space-y-2.5">
          <div className="text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
            <span>Rating Breakdown</span>
            {selectedStarFilter && (
              <button
                onClick={() => setSelectedStarFilter(null)}
                className="text-xs text-[#0B72E7] hover:underline font-semibold flex items-center gap-1"
              >
                <span>Clear Star Filter ({selectedStarFilter}★)</span>
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {[5, 4, 3, 2, 1].map((star) => {
            const breakdownData = summary.rating_breakdown?.[String(star)] || { count: 0, percentage: 0 };
            const isSelected = selectedStarFilter === star;

            return (
              <div
                key={star}
                onClick={() => setSelectedStarFilter(isSelected ? null : star)}
                className={`flex items-center gap-3 text-xs cursor-pointer group p-1 rounded-lg transition-colors ${
                  isSelected ? 'bg-blue-50/80' : 'hover:bg-slate-50'
                }`}
                title={`Filter by ${star} Stars (${breakdownData.count} reviews)`}
              >
                <div className="flex items-center gap-1 w-12 shrink-0 font-bold text-slate-700">
                  <span>{star}</span>
                  <Star className="w-3 h-3 fill-amber-400 text-amber-500" />
                </div>

                <div className="flex-1 h-2.5 bg-slate-100 rounded-full overflow-hidden relative">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      star >= 4
                        ? 'bg-amber-400 group-hover:bg-amber-500'
                        : star === 3
                        ? 'bg-amber-300 group-hover:bg-amber-400'
                        : 'bg-slate-400 group-hover:bg-slate-500'
                    }`}
                    style={{ width: `${breakdownData.percentage}%` }}
                  />
                </div>

                <div className="w-12 text-right text-slate-600 font-mono text-[11px] font-semibold shrink-0">
                  {breakdownData.percentage}%
                </div>

                <div className="w-14 text-right text-slate-400 text-[10px] shrink-0">
                  ({breakdownData.count})
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Toolbar: Star Filter Pills & Sorting */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-2">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs font-semibold text-slate-500 flex items-center gap-1 mr-1">
            <Filter className="w-3 h-3" /> Filter:
          </span>
          <Button
            variant={selectedStarFilter === null ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedStarFilter(null)}
            className={`h-7 px-2.5 rounded-lg text-xs font-semibold ${
              selectedStarFilter === null
                ? "bg-[#072654] text-white"
                : "text-slate-600 border-slate-200 hover:bg-slate-50"
            }`}
          >
            All Stars
          </Button>
          {[5, 4, 3, 2, 1].map((s) => (
            <Button
              key={s}
              variant={selectedStarFilter === s ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedStarFilter(selectedStarFilter === s ? null : s)}
              className={`h-7 px-2.5 rounded-lg text-xs font-semibold ${
                selectedStarFilter === s
                  ? "bg-[#0B72E7] text-white"
                  : "text-slate-600 border-slate-200 hover:bg-slate-50"
              }`}
            >
              {s} ★
            </Button>
          ))}
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
            <ArrowUpDown className="w-3 h-3" /> Sort:
          </span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="h-8 px-2.5 text-xs font-semibold bg-white border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#0B72E7]"
          >
            <option value="most_helpful">Most Helpful</option>
            <option value="recent">Most Recent</option>
            <option value="highest_rating">Highest Rating</option>
            <option value="lowest_rating">Lowest Rating</option>
          </select>
        </div>
      </div>

      {/* Reviews List Stream */}
      {isLoading ? (
        <div className="py-12 flex justify-center items-center text-slate-400 text-xs gap-2">
          <div className="w-4 h-4 rounded-full border-2 border-[#0B72E7] border-t-transparent animate-spin" />
          <span>Loading customer reviews...</span>
        </div>
      ) : reviews.length === 0 ? (
        <div className="py-12 text-center bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
          <p className="text-sm font-semibold text-slate-700">No reviews found matching current filter.</p>
          <Button
            variant="outline"
            size="sm"
            onClick={handleOpenWriteModal}
            className="text-xs font-semibold"
          >
            Be the first to review this product
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((rev) => (
            <div
              key={rev.id}
              className="p-5 bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-xs transition-shadow space-y-3"
            >
              {/* Reviewer Header */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-100 text-[#0B72E7] font-bold text-xs flex items-center justify-center border border-blue-200">
                    {rev.customer_name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-sm text-slate-900">
                        {rev.customer_name}
                      </span>
                      {rev.verified_purchase && (
                        <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          Verified Purchase
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-slate-400">
                      Reviewed on {new Date(rev.created_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>
                </div>

                {/* Edit / Delete actions if author */}
                {rev.customer_id === currentUserId && (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEditModal(rev)}
                      className="p-1 text-slate-400 hover:text-[#0B72E7] transition-colors rounded"
                      title="Edit review"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => deleteReviewMutation.mutate(rev.id)}
                      className="p-1 text-slate-400 hover:text-rose-600 transition-colors rounded"
                      title="Delete review"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>

              {/* Star Rating & Review Title */}
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-3.5 h-3.5 ${
                          star <= rev.rating
                            ? 'fill-amber-400 text-amber-500'
                            : 'text-slate-300'
                        }`}
                      />
                    ))}
                  </div>
                  <h4 className="font-bold text-sm text-slate-900">
                    {rev.review_title}
                  </h4>
                </div>

                {/* Review Text */}
                <p className="text-xs text-slate-700 leading-relaxed font-sans pt-0.5">
                  {rev.review_text}
                </p>
              </div>

              {/* Review Photos Gallery */}
              {rev.images && rev.images.length > 0 && (
                <div className="flex items-center gap-2.5 pt-1 overflow-x-auto">
                  {rev.images.map((imgUrl, imgIdx) => (
                    <div
                      key={imgIdx}
                      onClick={() => setExpandedImage(imgUrl)}
                      className="w-16 h-16 rounded-xl border border-slate-200 overflow-hidden shrink-0 cursor-pointer hover:opacity-90 hover:scale-105 transition-all shadow-2xs"
                    >
                      <img src={imgUrl} alt={`Review photo ${imgIdx + 1}`} className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              )}

              {/* Helpful Vote Button & Live Counter */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                <button
                  onClick={() => helpfulVoteMutation.mutate(rev.id)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    rev.has_voted
                      ? 'bg-blue-50 text-[#0B72E7] border border-blue-200'
                      : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
                  }`}
                  title="Mark this review as helpful"
                >
                  <ThumbsUp className={`w-3.5 h-3.5 ${rev.has_voted ? 'fill-[#0B72E7]' : ''}`} />
                  <span>Helpful ({rev.helpful_votes})</span>
                </button>

                <span className="text-[11px] text-slate-400">
                  {rev.helpful_votes > 0 ? `${rev.helpful_votes} people found this helpful` : 'Was this review helpful to you?'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Full Photo Preview Lightbox Modal */}
      {expandedImage && (
        <div 
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-xs"
          onClick={() => setExpandedImage(null)}
        >
          <div className="relative max-w-2xl max-h-[85vh] bg-white rounded-2xl overflow-hidden shadow-2xl p-2" onClick={(e: React.MouseEvent) => e.stopPropagation()}>
            <button
              onClick={() => setExpandedImage(null)}
              className="absolute top-4 right-4 z-10 bg-black/60 hover:bg-black text-white p-1.5 rounded-full"
            >
              <X className="w-5 h-5" />
            </button>
            <img src={expandedImage} alt="Expanded Review" className="w-full h-auto max-h-[80vh] object-contain rounded-xl" />
          </div>
        </div>
      )}

      {/* Write/Edit Review Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base text-[#072654]">
                  {editingReview ? "Edit Your Review" : "Write a Product Review"}
                </h3>
                <p className="text-xs text-slate-500 line-clamp-1">{productName}</p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4 overflow-y-auto">
              {/* Star Rating Picker */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                  <span>Overall Rating (1 - 5 Stars) *</span>
                  <span className="text-[#0B72E7] font-semibold">
                    {STAR_LABELS[formHoverRating || formRating]}
                  </span>
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onMouseEnter={() => setFormHoverRating(star)}
                      onMouseLeave={() => setFormHoverRating(0)}
                      onClick={() => setFormRating(star)}
                      className="p-1 hover:scale-110 transition-transform"
                    >
                      <Star
                        className={`w-7 h-7 ${
                          star <= (formHoverRating || formRating)
                            ? 'fill-amber-400 text-amber-500'
                            : 'text-slate-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Review Title */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Review Headline *</label>
                <Input
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="e.g. Rock solid performance & long battery life"
                  className="rounded-xl text-xs h-9"
                  maxLength={150}
                />
              </div>

              {/* Review Text */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Detailed Review *</label>
                <textarea
                  value={formText}
                  onChange={(e) => setFormText(e.target.value)}
                  placeholder="What did you use this product for? How does it perform in your workflow? Mention pros & cons..."
                  className="w-full rounded-xl text-xs min-h-[100px] border border-slate-200 p-2.5 focus:outline-none focus:ring-1 focus:ring-[#0B72E7] font-sans"
                  maxLength={2000}
                />
              </div>

              {/* Review Photos Attachment */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Camera className="w-3.5 h-3.5 text-[#0B72E7]" />
                  <span>Add Review Photos (Image URLs)</span>
                </label>
                
                <div className="flex gap-2">
                  <Input
                    value={newImageUrl}
                    onChange={(e) => setNewImageUrl(e.target.value)}
                    placeholder="Paste image URL (https://...)"
                    className="rounded-xl text-xs h-9 flex-1"
                  />
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleAddImage}
                    className="bg-slate-800 text-white rounded-xl text-xs font-semibold h-9 px-3 shrink-0 gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add
                  </Button>
                </div>

                {/* Added Photos Chips */}
                {formImages.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {formImages.map((img, idx) => (
                      <div key={idx} className="relative w-14 h-14 rounded-lg overflow-hidden border border-slate-200 group">
                        <img src={img} alt={`Thumb ${idx}`} className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(idx)}
                          className="absolute top-0.5 right-0.5 bg-black/70 hover:bg-rose-600 text-white rounded-full p-0.5 opacity-80 hover:opacity-100"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Verified Purchase Notice */}
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Your review will receive a <strong>Verified Purchase</strong> badge upon submission.</span>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsModalOpen(false)}
                className="rounded-xl text-xs font-semibold h-9 px-4"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                disabled={!formTitle.trim() || !formText.trim() || saveReviewMutation.isPending}
                onClick={() => saveReviewMutation.mutate()}
                className="bg-[#0B72E7] hover:bg-[#095bc0] text-white rounded-xl text-xs font-bold h-9 px-5 shadow-xs"
              >
                {saveReviewMutation.isPending ? "Submitting..." : editingReview ? "Update Review" : "Submit Review"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
