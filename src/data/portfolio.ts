export type PortfolioBrand = {
  slug: string;
  name: string;
  eyebrow: string;
  summary: string;
  mediaType: 'photo' | 'video' | 'photo & video';
  cover: string;
  coverPosition?: string;
  cardCover?: string;
  cardCoverPosition?: string;
  images: string[];
  videos?: PortfolioVideo[];
};

export type PortfolioVideo = {
  title: string;
  src: string;
  poster: string;
  orientation?: 'landscape' | 'portrait';
};

const asset = (filename: string) => `/assets/portfolio/${filename}`;

export const portfolioBrands: PortfolioBrand[] = [
  {
    slug: 'stormtech',
    name: 'Stormtech',
    eyebrow: 'Outdoor apparel campaign',
    summary: 'Technical apparel photographed in the environments it was built for.',
    mediaType: 'photo',
    cover: asset('hero-stormtech.jpg'),
    coverPosition: 'center 35%',
    cardCover: asset('DSC09740-Edit-5-0f12daa3-1000-683x1024.jpg'),
    images: [
      'DSC09740-Edit-5-0f12daa3-1000-683x1024.jpg',
      'DSC099062-5-46f818bf-1000-683x1024.jpg',
      'DSC09898-Edit-4-3b199119-1000-683x1024.jpg',
      'DSC00063-4-e7229751-1000-683x1024.jpg',
      'DSC00050-3-c6a4c552-1000-683x1024.jpg',
    ].map(asset),
  },
  {
    slug: 'promaster',
    name: 'Promaster',
    eyebrow: 'Adventure product campaign',
    summary: 'Field-tested product imagery shaped around movement, place, and real use.',
    mediaType: 'photo & video',
    cover: asset('hero-promaster.jpg'),
    cardCover: asset('DSC00984-1-819x1024.jpg'),
    cardCoverPosition: 'center 38%',
    images: [
      'DSC00984-1-819x1024.jpg',
      'DSC01589-1-819x1024.jpg',
      'DSC01572-Edit-819x1024.jpg',
      'DSC01526-819x1024.jpg',
      'DSC00925-Edit-819x1024.jpg',
      'DSC00877-819x1024.jpg',
    ].map(asset),
    videos: [
      {
        title: 'Chronicle Tripod',
        src: 'https://media.ivanpkchan.com/videos/promaster-chronicle-tripod.mp4',
        poster: asset('promaster-chronicle-video-poster.jpg'),
        orientation: 'portrait',
      },
    ],
  },
  {
    slug: '8bplus',
    name: '8BPlus',
    eyebrow: 'Climbing campaign',
    summary: 'A playful climbing story created across stills and motion.',
    mediaType: 'photo & video',
    cover: asset('hero-8bplus.jpg'),
    cardCover: asset('8BPlus-3-1-683x1024.jpg'),
    images: [
      '8BPlus-3-1-683x1024.jpg',
      'DSC02891-2-d034b077-1000-683x1024.jpg',
      '8BPlus-3-683x1024.jpg',
      'DSC02861-2-22833284-1000-683x1024.jpg',
      '8BPlus-2-683x1024.jpg',
      'DSC02737-4-079c100d-1000-683x1024.jpg',
      '8bplus-gallery-9.jpg',
      '8bplus-gallery-16.jpg',
      '8bplus-gallery-17.jpg',
    ].map(asset),
    videos: [
      {
        title: '8BPlus campaign film',
        src: 'https://media.ivanpkchan.com/videos/8bplus.mp4',
        poster: asset('8bplus-video-poster.jpg'),
        orientation: 'landscape',
      },
    ],
  },
  {
    slug: 'hibear',
    name: 'HiBear',
    eyebrow: 'Travel product campaign',
    summary: 'Lifestyle imagery built around slow mornings and life outside.',
    mediaType: 'photo',
    cover: asset('hero-hibear.jpg'),
    coverPosition: 'center 55%',
    cardCover: asset('campaign-hibear.jpg'),
    images: [
      'DJI_0717-a7c45642-1000-819x1024.jpg',
      'DSC03577-3-5573d4b1-1000-819x1024.jpg',
      'DSC03582-2-3c85db8c-1000-819x1024.jpg',
      'DSC03589-2-8cb9d45f-1000-819x1024.jpg',
      'DSC04050-Edit-2-a1651af0-1000-819x1024.jpg',
      'DSC04075-2-53d29803-1000-819x1024.jpg',
    ].map(asset),
  },
  {
    slug: 'adobe',
    name: 'Adobe',
    eyebrow: 'Creative software campaign',
    summary: 'A product-focused film highlighting new tools in Adobe Lightroom.',
    mediaType: 'video',
    cover: asset('adobe-video-poster.jpg'),
    coverPosition: 'center 38%',
    cardCover: asset('campaign-adobe.jpg'),
    images: [],
    videos: [
      {
        title: 'Lightroom new features',
        src: 'https://media.ivanpkchan.com/videos/adobe-lightroom-new-features.mp4',
        poster: asset('adobe-video-poster.jpg'),
        orientation: 'portrait',
      },
    ],
  },
  {
    slug: 'tamron',
    name: 'Tamron',
    eyebrow: 'Camera lens campaign',
    summary: 'A series of product films exploring Tamron lenses across photography genres.',
    mediaType: 'video',
    cover: asset('hero-tamron.jpg'),
    coverPosition: 'center 78%',
    cardCover: asset('campaign-tamron.jpg'),
    images: [],
    videos: [
      {
        title: '17–28mm — Astro',
        src: 'https://media.ivanpkchan.com/videos/tamron-17-28mm-astro.mp4',
        poster: asset('tamron-17-28mm-astro-video-poster.jpg'),
        orientation: 'portrait',
      },
      {
        title: '35–100mm',
        src: 'https://media.ivanpkchan.com/videos/tamron-35-100mm.mp4',
        poster: asset('tamron-35-100mm-video-poster.jpg'),
        orientation: 'portrait',
      },
      {
        title: '90mm',
        src: 'https://media.ivanpkchan.com/videos/tamron-90mm.mp4',
        poster: asset('tamron-90mm-video-poster.jpg'),
        orientation: 'portrait',
      },
      {
        title: '90mm — Part 2',
        src: 'https://media.ivanpkchan.com/videos/tamron-90mm-2.mp4',
        poster: asset('tamron-90mm-2-video-poster.jpg'),
        orientation: 'portrait',
      },
    ],
  },
  {
    slug: 'sawyer',
    name: 'Sawyer',
    eyebrow: 'Outdoor gear campaign',
    summary: 'A fast-paced product film built around Sawyer filtration in the outdoors.',
    mediaType: 'video',
    cover: asset('hero-sawyer.jpg'),
    cardCover: asset('campaign-sawyer.jpg'),
    images: [],
    videos: [
      {
        title: 'Sawyer campaign film',
        src: 'https://media.ivanpkchan.com/videos/sawyer.mp4',
        poster: asset('sawyer-video-poster.jpg'),
        orientation: 'portrait',
      },
      {
        title: 'Sawyer campaign film — Part 2',
        src: 'https://media.ivanpkchan.com/videos/sawyer-2.mp4',
        poster: asset('sawyer-2-video-poster.jpg'),
        orientation: 'portrait',
      },
    ],
  },
  {
    slug: 'gsi',
    name: 'GSI',
    eyebrow: 'Outdoor cookware campaign',
    summary: 'A camp-focused product story shaped around meals and time outside.',
    mediaType: 'photo & video',
    cover: asset('hero-gsi.jpg'),
    cardCover: asset('campaign-gsi.jpg'),
    images: [
      'gsi-gallery-1.jpg',
      'gsi-gallery-3.jpg',
      'gsi-gallery-4.jpg',
      'gsi-gallery-5.jpg',
      'gsi-gallery-8.jpg',
      'gsi-gallery-10.jpg',
    ].map(asset),
    videos: [
      {
        title: 'GSI campaign film',
        src: 'https://media.ivanpkchan.com/videos/gsi.mp4',
        poster: asset('gsi-video-poster.jpg'),
        orientation: 'portrait',
      },
    ],
  },
];
