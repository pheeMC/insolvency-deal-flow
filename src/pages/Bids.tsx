import { useState, useEffect } from 'react';
import { supabaseBidsService as bidsService } from '@/services/supabaseBidsService';
import { Bid as ApiBid } from '@/types/api';
import { showSuccessToast, showErrorToast, showLoadingToast } from '@/components/ui/toast-notifications';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  Gavel,
  Clock,
  DollarSign,
  FileText,
  Lock,
  Unlock,
  Eye,
  Download,
  AlertTriangle,
  CheckCircle,
  Users,
  Calendar,
} from 'lucide-react';

interface LocalBid {
  id: string;
  bidderName: string;
  bidderType: 'strategic' | 'financial' | 'management';
  amount: number;
  currency: string;
  structure: 'asset-deal' | 'share-deal' | 'hybrid';
  status: 'draft' | 'submitted' | 'sealed' | 'opened' | 'shortlisted';
  submittedAt?: string;
  sealedUntil?: string;
  conditions: string[];
  proofOfFunds: {
    provided: boolean;
    amount?: number;
    bankConfirmation?: boolean;
  };
  earnOut?: {
    percentage: number;
    trigger: string;
  };
  employeeRetention: {
    percentage: number;
    period: string;
  };
  timeline: {
    dueDiligenceWeeks: number;
    closingWeeks: number;
  };
  tsa?: {
    required: boolean;
    duration?: string;
  };
}

const mockBids: LocalBid[] = [
  {
    id: '1',
    bidderName: 'Strategic Investor Alpha',
    bidderType: 'strategic',
    amount: 12500000,
    currency: 'EUR',
    structure: 'asset-deal',
    status: 'sealed',
    submittedAt: '2024-01-15T23:59:00Z',
    sealedUntil: '2024-01-30T12:00:00Z',
    conditions: ['Financing confirmed', 'Regulatory approval pending'],
    proofOfFunds: {
      provided: true,
      amount: 15000000,
      bankConfirmation: true,
    },
    earnOut: {
      percentage: 15,
      trigger: 'EBITDA > €2M in 2025',
    },
    employeeRetention: {
      percentage: 95,
      period: '12 months',
    },
    timeline: {
      dueDiligenceWeeks: 4,
      closingWeeks: 8,
    },
    tsa: {
      required: true,
      duration: '6 months',
    },
  },
  {
    id: '2',
    bidderName: 'Financial Investor Beta',
    bidderType: 'financial',
    amount: 11800000,
    currency: 'EUR',
    structure: 'asset-deal',
    status: 'sealed',
    submittedAt: '2024-01-16T15:30:00Z',
    sealedUntil: '2024-01-30T12:00:00Z',
    conditions: ['Fund approval pending', 'Key employee retention'],
    proofOfFunds: {
      provided: true,
      amount: 20000000,
      bankConfirmation: true,
    },
    employeeRetention: {
      percentage: 85,
      period: '18 months',
    },
    timeline: {
      dueDiligenceWeeks: 6,
      closingWeeks: 10,
    },
    tsa: {
      required: false,
    },
  },
  {
    id: '3',
    bidderName: 'Management Buyout Team',
    bidderType: 'management',
    amount: 9500000,
    currency: 'EUR',
    structure: 'hybrid',
    status: 'draft',
    conditions: ['Financing arrangement pending'],
    proofOfFunds: {
      provided: false,
    },
    employeeRetention: {
      percentage: 100,
      period: '24 months',
    },
    timeline: {
      dueDiligenceWeeks: 2,
      closingWeeks: 6,
    },
  },
];

export default function Bids() {
  const [bids, setBids] = useState<ApiBid[]>([]);
  const [selectedBid, setSelectedBid] = useState<LocalBid | null>(null);
  const [showComparison, setShowComparison] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load bids from Supabase
  useEffect(() => {
    const fetchBids = async () => {
      try {
        const response = await bidsService.getBids();
        setBids(response);
        // If no API bids, use mock data for now
        if (response.length === 0) {
          setSelectedBid(mockBids[0]);
        }
      } catch (error) {
        console.error('Failed to fetch bids:', error);
        // Fallback to mock data
        setSelectedBid(mockBids[0]);
      } finally {
        setLoading(false);
      }
    };

    fetchBids();
  }, []);

  // Use API bids if available, otherwise fall back to mock data
  const displayBids = bids.length > 0 ? bids : [];
  const hasMockData = bids.length === 0;

  const getBidderTypeBadgeVariant = (type: LocalBid['bidderType']) => {
    switch (type) {
      case 'strategic':
        return 'default';
      case 'financial':
        return 'secondary';
      case 'management':
        return 'outline';
    }
  };

  const getStatusBadgeVariant = (status: LocalBid['status']) => {
    switch (status) {
      case 'draft':
        return 'outline';
      case 'submitted':
        return 'secondary';
      case 'sealed':
        return 'destructive';
      case 'opened':
        return 'default';
      case 'shortlisted':
        return 'default';
    }
  };

  const getStatusIcon = (status: LocalBid['status']) => {
    switch (status) {
      case 'sealed':
        return <Lock className="h-3 w-3" />;
      case 'opened':
        return <Unlock className="h-3 w-3" />;
      case 'shortlisted':
        return <CheckCircle className="h-3 w-3" />;
      default:
        return <FileText className="h-3 w-3" />;
    }
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const sealedBids = mockBids.filter(bid => bid.status === 'sealed');
  const timeToOpening = new Date('2024-01-30T12:00:00Z').getTime() - new Date().getTime();
  const daysToOpening = Math.ceil(timeToOpening / (1000 * 60 * 60 * 24));

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-sm text-muted-foreground">Loading bids...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Bid Management</h1>
          <p className="text-muted-foreground mt-2">
            Manage sealed bids and comparison for the M&A process
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => setShowComparison(!showComparison)}
            disabled={sealedBids.length === 0}
          >
            <Eye className="h-4 w-4 mr-2" />
            Compare Bids
          </Button>
          <Button className="gap-2" disabled={sealedBids.length === 0}>
            <Unlock className="h-4 w-4" />
            Open Sealed Bids
          </Button>
        </div>
      </div>

      {/* Bid Opening Timer */}
      {sealedBids.length > 0 && (
        <Card className="border-warning/20 bg-warning/5">
          <CardContent className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <div className="bg-warning/20 p-2 rounded-full">
                <Clock className="h-4 w-4 text-warning" />
              </div>
              <div>
                <p className="font-medium">Sealed Bid Opening</p>
                <p className="text-sm text-muted-foreground">
                  {sealedBids.length} sealed bids will be opened in {daysToOpening} days
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium">January 30, 2024 at 12:00 PM</p>
              <p className="text-xs text-muted-foreground">Automatic opening</p>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Bid List */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gavel className="h-5 w-5" />
                Submitted Bids ({mockBids.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="space-y-1">
                {mockBids.map(bid => (
                  <div
                    key={bid.id}
                    className={`
                      p-4 cursor-pointer hover:bg-accent/50 border-b border-border/50
                      ${selectedBid?.id === bid.id ? 'bg-primary/5 border-primary/50' : ''}
                    `}
                    onClick={() => setSelectedBid(bid)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <Badge variant={getBidderTypeBadgeVariant(bid.bidderType)} className="text-xs">
                        {bid.bidderType}
                      </Badge>
                      <Badge variant={getStatusBadgeVariant(bid.status)} className="text-xs gap-1">
                        {getStatusIcon(bid.status)}
                        {bid.status}
                      </Badge>
                    </div>
                    <h3 className="font-medium text-sm mb-1">
                      {bid.bidderName}
                    </h3>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span className="font-medium">
                        {bid.status === 'sealed' ? 'SEALED' : formatCurrency(bid.amount, bid.currency)}
                      </span>
                      {bid.submittedAt && (
                        <span>{formatDate(bid.submittedAt)}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bid Detail */}
        <div className="lg:col-span-2">
          {selectedBid ? (
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2 mb-2">
                      {selectedBid.bidderName}
                    </CardTitle>
                    <div className="flex items-center gap-4 text-sm">
                      <Badge variant={getBidderTypeBadgeVariant(selectedBid.bidderType)}>
                        {selectedBid.bidderType}
                      </Badge>
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-3 w-3" />
                        <span className="font-medium">
                          {selectedBid.status === 'sealed' 
                            ? 'SEALED UNTIL OPENING' 
                            : formatCurrency(selectedBid.amount, selectedBid.currency)
                          }
                        </span>
                      </div>
                    </div>
                  </div>
                  <Badge variant={getStatusBadgeVariant(selectedBid.status)} className="gap-1">
                    {getStatusIcon(selectedBid.status)}
                    {selectedBid.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {selectedBid.status !== 'sealed' && (
                  <>
                    {/* Bid Structure */}
                    <div>
                      <h4 className="font-medium mb-3">Bid Structure</h4>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Structure:</span>
                          <p className="font-medium capitalize">{selectedBid.structure}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Currency:</span>
                          <p className="font-medium">{selectedBid.currency}</p>
                        </div>
                        {selectedBid.earnOut && (
                          <div>
                            <span className="text-muted-foreground">Earn-out:</span>
                            <p className="font-medium">
                              {selectedBid.earnOut.percentage}% - {selectedBid.earnOut.trigger}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Proof of Funds */}
                    <div>
                      <h4 className="font-medium mb-3">Proof of Funds</h4>
                      <div className="flex items-center justify-between p-3 bg-accent/30 rounded-lg">
                        <div className="flex items-center gap-3">
                          {selectedBid.proofOfFunds.provided ? (
                            <CheckCircle className="h-4 w-4 text-success" />
                          ) : (
                            <AlertTriangle className="h-4 w-4 text-warning" />
                          )}
                          <div>
                            <p className="text-sm font-medium">
                              {selectedBid.proofOfFunds.provided ? 'Provided' : 'Pending'}
                            </p>
                            {selectedBid.proofOfFunds.amount && (
                              <p className="text-xs text-muted-foreground">
                                Confirmed: {formatCurrency(selectedBid.proofOfFunds.amount, selectedBid.currency)}
                              </p>
                            )}
                          </div>
                        </div>
                        {selectedBid.proofOfFunds.bankConfirmation && (
                          <Badge variant="outline" className="text-xs">
                            Bank Confirmed
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Employee Retention */}
                    <div>
                      <h4 className="font-medium mb-3">Employee Retention</h4>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span>Target Retention</span>
                          <span className="font-medium">{selectedBid.employeeRetention.percentage}%</span>
                        </div>
                        <Progress value={selectedBid.employeeRetention.percentage} className="h-2" />
                        <p className="text-xs text-muted-foreground">
                          For {selectedBid.employeeRetention.period}
                        </p>
                      </div>
                    </div>

                    {/* Timeline */}
                    <div>
                      <h4 className="font-medium mb-3">Timeline</h4>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-3 w-3" />
                          <div>
                            <p className="text-muted-foreground">Due Diligence</p>
                            <p className="font-medium">{selectedBid.timeline.dueDiligenceWeeks} weeks</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-3 w-3" />
                          <div>
                            <p className="text-muted-foreground">To Closing</p>
                            <p className="font-medium">{selectedBid.timeline.closingWeeks} weeks</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Conditions */}
                    <div>
                      <h4 className="font-medium mb-3">Conditions & Requirements</h4>
                      <div className="space-y-2">
                        {selectedBid.conditions.map((condition, index) => (
                          <div key={index} className="flex items-center gap-2 text-sm">
                            <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                            <span>{condition}</span>
                          </div>
                        ))}
                        {selectedBid.tsa?.required && (
                          <div className="flex items-center gap-2 text-sm">
                            <div className="w-1.5 h-1.5 bg-warning rounded-full" />
                            <span>TSA required for {selectedBid.tsa.duration}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                )}

                {selectedBid.status === 'sealed' && (
                  <div className="text-center py-8">
                    <div className="bg-destructive/10 p-4 rounded-lg inline-block">
                      <Lock className="h-8 w-8 text-destructive mx-auto mb-2" />
                      <p className="font-medium text-destructive">Bid is Sealed</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Details will be available after opening on {formatDate(selectedBid.sealedUntil!)}
                      </p>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-3 pt-4 border-t">
                  <Button size="sm" variant="outline" className="gap-2">
                    <Download className="h-3 w-3" />
                    Export Details
                  </Button>
                  <Button size="sm" variant="outline" className="gap-2">
                    <Users className="h-3 w-3" />
                    Contact Bidder
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center h-96">
                <div className="text-center text-muted-foreground">
                  <Gavel className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>Select a bid to view details</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}