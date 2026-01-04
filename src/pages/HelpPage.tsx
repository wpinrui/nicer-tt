import './HelpPage.scss';

import { ArrowLeft, ImageIcon, Search, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

type Category = 'events' | 'export-share' | 'settings';

interface FeatureCard {
  id: string;
  title: string;
  description: string;
  image?: string;
  category: Category;
  keywords: string[];
}

const FEATURE_CARDS: FeatureCard[] = [
  // Events
  {
    id: 'add-custom-event',
    title: 'Add Custom Events',
    description:
      'Create personal events that appear alongside your NIE classes. Set the date, time, venue, and description.',
    category: 'events',
    keywords: ['custom', 'add', 'create', 'personal', 'event', 'new'],
  },
  {
    id: 'add-upgrading',
    title: 'Add Upgrading Courses',
    description:
      'Add content upgrading classes to your timetable. Browse available courses and add all sessions at once.',
    category: 'events',
    keywords: ['upgrading', 'content', 'courses', 'add'],
  },
  {
    id: 'edit-events',
    title: 'Edit Event Details',
    description:
      'Modify the venue, tutor, or time of any imported event. Your changes are saved locally and included in exports.',
    category: 'events',
    keywords: ['edit', 'modify', 'change', 'venue', 'tutor', 'time', 'override'],
  },
  {
    id: 'delete-events',
    title: 'Delete Events',
    description:
      "Hide events you don't need. Deleted events won't appear in your view or exports. Restore them by regenerating.",
    category: 'events',
    keywords: ['delete', 'remove', 'hide', 'event'],
  },
  {
    id: 'regenerate',
    title: 'Regenerate Timetable',
    description:
      'Update your timetable with a new HTML file while keeping all your custom events and upgrading courses intact.',
    category: 'events',
    keywords: ['regenerate', 'update', 'refresh', 'new', 'html', 'keep'],
  },

  // Export & Share
  {
    id: 'download-ics',
    title: 'Download ICS File',
    description:
      'Export your timetable as an ICS file. Choose which custom events and upgrading courses to include.',
    category: 'export-share',
    keywords: ['download', 'ics', 'export', 'file', 'calendar'],
  },
  {
    id: 'share-link',
    title: 'Share Your Timetable',
    description:
      'Generate a share link that others can use to view or import your timetable. No account needed.',
    category: 'export-share',
    keywords: ['share', 'link', 'send', 'friends', 'copy'],
  },
  {
    id: 'import-shared',
    title: 'Import Shared Timetable',
    description:
      "Open a share link to view someone's timetable temporarily, or add it to your collection for comparison.",
    category: 'export-share',
    keywords: ['import', 'shared', 'view', 'add', 'collection'],
  },
  {
    id: 'compare-timetables',
    title: 'Compare Timetables',
    description:
      'View two timetables side-by-side. Find common days, matching free slots, or times to travel/eat together.',
    category: 'export-share',
    keywords: ['compare', 'side-by-side', 'travel', 'eat', 'together', 'common'],
  },

  // Settings
  {
    id: 'dark-mode',
    title: 'Dark Mode',
    description: 'Toggle between light and dark themes for comfortable viewing in any environment.',
    category: 'settings',
    keywords: ['dark', 'light', 'theme', 'mode', 'toggle'],
  },
  {
    id: 'show-tutor',
    title: 'Show/Hide Tutors',
    description: 'Toggle tutor names on or off in the event list for a cleaner view.',
    category: 'settings',
    keywords: ['tutor', 'show', 'hide', 'display', 'name'],
  },
  {
    id: 'custom-background',
    title: 'Custom Background',
    description:
      'Set a plain background or use your own image URL. Desktop only - mobile uses a solid color.',
    category: 'settings',
    keywords: ['background', 'image', 'custom', 'plain', 'wallpaper'],
  },
  {
    id: 'factory-reset',
    title: 'Factory Reset',
    description:
      'Clear all data including timetables, custom events, and settings. Use this for a fresh start.',
    category: 'settings',
    keywords: ['reset', 'clear', 'delete', 'all', 'factory', 'fresh'],
  },
];

const CATEGORY_LABELS: Record<Category, string> = {
  events: 'Events',
  'export-share': 'Export & Share',
  settings: 'Settings',
};

const CATEGORIES: Category[] = ['events', 'export-share', 'settings'];

function HelpPage() {
  const [activeCategory, setActiveCategory] = useState<Category>('events');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedImage, setExpandedImage] = useState<{ src: string; title: string } | null>(null);

  const filteredCards = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();

    if (!query) {
      return FEATURE_CARDS.filter((card) => card.category === activeCategory);
    }

    // When searching, show all matching cards regardless of category
    return FEATURE_CARDS.filter(
      (card) =>
        card.title.toLowerCase().includes(query) ||
        card.description.toLowerCase().includes(query) ||
        card.keywords.some((kw) => kw.includes(query))
    );
  }, [activeCategory, searchQuery]);

  const handleClearSearch = () => {
    setSearchQuery('');
  };

  return (
    <div className="help-page">
      <div className="help-header">
        <Link to="/" className="back-btn">
          <ArrowLeft size={18} />
          Back to Timetable
        </Link>
        <h1>Help & Guide</h1>
      </div>

      <div className="help-search">
        <Search size={16} className="search-icon" />
        <input
          type="text"
          placeholder="Search features..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        {searchQuery && (
          <button className="clear-search-btn" onClick={handleClearSearch}>
            <X size={16} />
          </button>
        )}
      </div>

      {!searchQuery && (
        <div className="help-tabs">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              className={`help-tab ${activeCategory === cat ? 'active' : ''}`}
              onClick={() => setActiveCategory(cat)}
            >
              {CATEGORY_LABELS[cat]}
            </button>
          ))}
        </div>
      )}

      {searchQuery && (
        <p className="search-results-info">
          {filteredCards.length} result{filteredCards.length !== 1 ? 's' : ''} for "{searchQuery}"
        </p>
      )}

      <div className="help-cards">
        {filteredCards.length === 0 ? (
          <div className="no-results">
            <p>No features found matching your search.</p>
            <button onClick={handleClearSearch}>Clear search</button>
          </div>
        ) : (
          filteredCards.map((card) => (
            <div key={card.id} className="feature-card">
              {card.image ? (
                <button
                  className="feature-image"
                  onClick={() => setExpandedImage({ src: card.image!, title: card.title })}
                >
                  <img src={card.image} alt={card.title} />
                </button>
              ) : (
                <div className="feature-image-placeholder">
                  <ImageIcon size={32} />
                  <span>Screenshot coming soon</span>
                </div>
              )}
              <div className="feature-content">
                <h3>{card.title}</h3>
                <p>{card.description}</p>
                {searchQuery && (
                  <span className="feature-category-badge">{CATEGORY_LABELS[card.category]}</span>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {expandedImage && (
        <div className="image-modal-overlay" onClick={() => setExpandedImage(null)}>
          <div className="image-modal" onClick={(e) => e.stopPropagation()}>
            <button className="image-modal-close" onClick={() => setExpandedImage(null)}>
              <X size={24} />
            </button>
            <div className="image-modal-title">{expandedImage.title}</div>
            <img src={expandedImage.src} alt={expandedImage.title} />
          </div>
        </div>
      )}
    </div>
  );
}

export default HelpPage;
