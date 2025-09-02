import { useState } from 'react';
import { supabaseBidsService as bidsService } from '@/services/supabaseBidsService';
import { Bid } from '@/types/api';
import { showSuccessToast, showErrorToast, showLoadingToast } from '@/components/ui/toast-notifications';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Gavel, Plus } from 'lucide-react';

interface BidModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onBidCreated: (bid: Bid) => void;
  bid?: Bid | null;
}

export function BidModal({
  open,
  onOpenChange,
  onBidCreated,
  bid,
}: BidModalProps) {
  const [bidderName, setBidderName] = useState(bid?.bidderName || '');
  const [bidderType, setBidderType] = useState(bid?.bidderType || 'financial');
  const [amount, setAmount] = useState(bid?.amount?.toString() || '');
  const [currency, setCurrency] = useState(bid?.currency || 'EUR');
  const [phase, setPhase] = useState(bid?.phase || 'NBO');
  const [status, setStatus] = useState(bid?.status || 'draft');
  const [submittedBy, setSubmittedBy] = useState(bid?.submittedBy || '');
  const [conditions, setConditions] = useState(bid?.conditions?.join(', ') || '');
  const [creating, setCreating] = useState(false);

  const handleSubmit = async () => {
    if (!bidderName.trim() || !amount || !submittedBy.trim()) return;

    setCreating(true);
    try {
      const toastId = showLoadingToast(bid ? 'Updating bid...' : 'Creating bid...');
      
      const bidData = {
        bidderName,
        bidderType,
        amount: parseFloat(amount),
        currency,
        phase,
        status,
        submittedAt: new Date().toISOString(),
        submittedBy,
        conditions: conditions ? conditions.split(',').map(c => c.trim()) : [],
        attachments: [],
      };

      let newBid: Bid;
      if (bid) {
        newBid = await bidsService.updateBid(bid.id, bidData);
      } else {
        newBid = await bidsService.createBid(bidData);
      }

      toast.dismiss(toastId);
      showSuccessToast(bid ? 'Bid updated successfully' : 'Bid created successfully');
      onBidCreated(newBid);
      onOpenChange(false);
      
      // Reset form
      setBidderName('');
      setBidderType('financial');
      setAmount('');
      setCurrency('EUR');
      setPhase('NBO');
      setStatus('draft');
      setSubmittedBy('');
      setConditions('');
    } catch (error) {
      console.error('Failed to save bid:', error);
      showErrorToast('Failed to save bid');
    } finally {
      setCreating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Gavel className="h-5 w-5" />
            {bid ? 'Edit Bid' : 'New Bid'}
          </DialogTitle>
          <DialogDescription>
            {bid ? 'Update the bid details.' : 'Create a new bid submission.'}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="bidderName">Bidder Name</Label>
              <Input
                id="bidderName"
                value={bidderName}
                onChange={(e) => setBidderName(e.target.value)}
                placeholder="Company or individual name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bidderType">Bidder Type</Label>
              <Select value={bidderType} onValueChange={setBidderType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="strategic">Strategic</SelectItem>
                  <SelectItem value="financial">Financial</SelectItem>
                  <SelectItem value="management">Management</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Bid Amount</Label>
              <Input
                id="amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="1000000"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="currency">Currency</Label>
              <Select value={currency} onValueChange={setCurrency}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="EUR">EUR</SelectItem>
                  <SelectItem value="USD">USD</SelectItem>
                  <SelectItem value="GBP">GBP</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phase">Phase</Label>
              <Select value={phase} onValueChange={setPhase}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="IOI">IOI</SelectItem>
                  <SelectItem value="NBO">NBO</SelectItem>
                  <SelectItem value="Final">Final Bid</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="submitted">Submitted</SelectItem>
                  <SelectItem value="sealed">Sealed</SelectItem>
                  <SelectItem value="opened">Opened</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="submittedBy">Submitted By</Label>
            <Input
              id="submittedBy"
              value={submittedBy}
              onChange={(e) => setSubmittedBy(e.target.value)}
              placeholder="John Doe"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="conditions">Conditions (Optional)</Label>
            <Textarea
              id="conditions"
              value={conditions}
              onChange={(e) => setConditions(e.target.value)}
              placeholder="Financing confirmed, Regulatory approval pending (comma separated)"
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={!bidderName.trim() || !amount || !submittedBy.trim() || creating}
          >
            {creating ? (bid ? 'Updating...' : 'Creating...') : (bid ? 'Update Bid' : 'Create Bid')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}