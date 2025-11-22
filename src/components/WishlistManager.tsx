import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  Heart, 
  Trash2, 
  ExternalLink, 
  Calendar, 
  MapPin,
  Award,
  Filter,
  Search,
  Download,
  Share2
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

interface WishlistEvent {
  id: string;
  title: string;
  organizer: string;
  description: string;
  category: string;
  startDate: string;
  endDate: string;
  registrationDeadline: string;
  location: string;
  mode: 'Online' | 'Offline' | 'Hybrid';
  prizes: string;
  prizeAmount?: number;
  website: string;
  registrationUrl: string;
  imageUrl: string;
  addedAt: string; // When it was added to wishlist
  priority: 'high' | 'medium' | 'low';
  notes?: string;
}

interface WishlistManagerProps {
  userId: string;
}

export function WishlistManager({ userId }: WishlistManagerProps) {
  const [wishlist, setWishlist] = useState<WishlistEvent[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');

  useEffect(() => {
    // Load wishlist from localStorage
    const saved = localStorage.getItem(`wishlist_${userId}`);
    if (saved) {
      try {
        setWishlist(JSON.parse(saved));
      } catch (error) {
        console.error('Error loading wishlist:', error);
      }
    }
  }, [userId]);

  const saveWishlist = (newWishlist: WishlistEvent[]) => {
    setWishlist(newWishlist);
    localStorage.setItem(`wishlist_${userId}`, JSON.stringify(newWishlist));
  };

  const removeFromWishlist = (eventId: string) => {
    const updated = wishlist.filter(e => e.id !== eventId);
    saveWishlist(updated);
    toast.success('Event removed from wishlist');
  };

  const updatePriority = (eventId: string, priority: 'high' | 'medium' | 'low') => {
    const updated = wishlist.map(e => 
      e.id === eventId ? { ...e, priority } : e
    );
    saveWishlist(updated);
    toast.success('Priority updated');
  };

  const filteredWishlist = wishlist.filter(event => {
    const matchesSearch = 
      event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.organizer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || event.category === categoryFilter;
    const matchesPriority = priorityFilter === 'all' || event.priority === priorityFilter;
    
    return matchesSearch && matchesCategory && matchesPriority;
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric' 
    });
  };

  const getDaysUntilDeadline = (deadline: string) => {
    const deadlineDate = new Date(deadline);
    const today = new Date();
    const daysUntilDeadline = Math.ceil((deadlineDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysUntilDeadline < 0) return 'Expired';
    if (daysUntilDeadline === 0) return 'Today';
    if (daysUntilDeadline === 1) return 'Tomorrow';
    return `${daysUntilDeadline} days left`;
  };

  const categories = ['all', ...Array.from(new Set(wishlist.map(e => e.category)))];

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-r from-pink-50 to-rose-50 border-pink-200">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="bg-pink-100 rounded-full p-3">
              <Heart className="h-6 w-6 text-pink-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-pink-900 mb-1">Your Event Wishlist</h3>
              <p className="text-sm text-pink-700">
                Save events you're interested in and track them all in one place. Set priorities and get reminded about deadlines!
              </p>
              <div className="flex gap-4 mt-3 text-sm text-pink-600">
                <span>Total: {wishlist.length} events</span>
                <span>•</span>
                <span>High Priority: {wishlist.filter(e => e.priority === 'high').length}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search wishlist..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map(cat => (
                  <SelectItem key={cat} value={cat} className="capitalize">
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Wishlist Content */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">
            All ({wishlist.length})
          </TabsTrigger>
          <TabsTrigger value="high">
            High Priority ({wishlist.filter(e => e.priority === 'high').length})
          </TabsTrigger>
          <TabsTrigger value="medium">
            Medium ({wishlist.filter(e => e.priority === 'medium').length})
          </TabsTrigger>
          <TabsTrigger value="low">
            Low ({wishlist.filter(e => e.priority === 'low').length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <WishlistGrid 
            events={filteredWishlist}
            onRemove={removeFromWishlist}
            onUpdatePriority={updatePriority}
            formatDate={formatDate}
            getDaysUntilDeadline={getDaysUntilDeadline}
            getPriorityColor={getPriorityColor}
          />
        </TabsContent>

        <TabsContent value="high">
          <WishlistGrid 
            events={filteredWishlist.filter(e => e.priority === 'high')}
            onRemove={removeFromWishlist}
            onUpdatePriority={updatePriority}
            formatDate={formatDate}
            getDaysUntilDeadline={getDaysUntilDeadline}
            getPriorityColor={getPriorityColor}
          />
        </TabsContent>

        <TabsContent value="medium">
          <WishlistGrid 
            events={filteredWishlist.filter(e => e.priority === 'medium')}
            onRemove={removeFromWishlist}
            onUpdatePriority={updatePriority}
            formatDate={formatDate}
            getDaysUntilDeadline={getDaysUntilDeadline}
            getPriorityColor={getPriorityColor}
          />
        </TabsContent>

        <TabsContent value="low">
          <WishlistGrid 
            events={filteredWishlist.filter(e => e.priority === 'low')}
            onRemove={removeFromWishlist}
            onUpdatePriority={updatePriority}
            formatDate={formatDate}
            getDaysUntilDeadline={getDaysUntilDeadline}
            getPriorityColor={getPriorityColor}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function WishlistGrid({ 
  events, 
  onRemove, 
  onUpdatePriority,
  formatDate,
  getDaysUntilDeadline,
  getPriorityColor
}: {
  events: WishlistEvent[];
  onRemove: (id: string) => void;
  onUpdatePriority: (id: string, priority: 'high' | 'medium' | 'low') => void;
  formatDate: (date: string) => string;
  getDaysUntilDeadline: (deadline: string) => string;
  getPriorityColor: (priority: string) => string;
}) {
  if (events.length === 0) {
    return (
      <Card className="p-12">
        <div className="text-center text-muted-foreground">
          <Heart className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>No events in this category</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {events.map(event => (
        <Card key={event.id} className="overflow-hidden hover:shadow-lg transition-shadow">
          <div className="relative h-40 bg-muted">
            <ImageWithFallback
              src={event.imageUrl}
              alt={event.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-3 right-3 flex gap-2">
              <Badge variant="secondary" className="bg-background/90 backdrop-blur">
                {event.category}
              </Badge>
            </div>
          </div>

          <div className="p-6 space-y-4">
            <div>
              <h3 className="line-clamp-1 mb-1">{event.title}</h3>
              <p className="text-sm text-muted-foreground">{event.organizer}</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-start gap-2 text-sm">
                <Calendar className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                <div>
                  <div>{formatDate(event.startDate)} - {formatDate(event.endDate)}</div>
                  <div className="text-xs text-muted-foreground">
                    Deadline: {formatDate(event.registrationDeadline)} ({getDaysUntilDeadline(event.registrationDeadline)})
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span>{event.location} • {event.mode}</span>
              </div>

              <div className="flex items-start gap-2 text-sm">
                <Award className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                <span className="line-clamp-1">{event.prizes}</span>
              </div>
            </div>

            {/* Priority Selector */}
            <div className="flex items-center gap-2">
              <span className="text-sm">Priority:</span>
              <Select 
                value={event.priority} 
                onValueChange={(value: 'high' | 'medium' | 'low') => onUpdatePriority(event.id, value)}
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
              <Badge className={getPriorityColor(event.priority)}>
                {event.priority}
              </Badge>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                className="flex-1"
                onClick={() => {
                  try {
                    window.open(event.registrationUrl, '_blank', 'noopener,noreferrer');
                  } catch (error) {
                    toast.error('Could not open registration link');
                  }
                }}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Register
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => onRemove(event.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>

            <div className="text-xs text-muted-foreground">
              Added {new Date(event.addedAt).toLocaleDateString('en-IN')}
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
