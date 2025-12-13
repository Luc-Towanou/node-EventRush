import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FeednewsService {
  constructor(private prisma: PrismaService) {}

  // Global feed: combine sections, tag with _type, sort by created_at, support simple pagination
  async getGlobalFeed(userId: number, page = 1, limit = 30) {
    const skip = (page - 1) * limit;

    // Parallel queries (limit results to keep response size reasonable)
    const [
      stories,
      community,
      highlights,
      articles,
      promos,
      lifestyle,
      eventPosts,
    ] = await Promise.all([
      this.prisma.stories.findMany({
        where: { expires_at: { gt: new Date() } },
        orderBy: { created_at: 'desc' },
        take: 12,
        include: { utilisateurs: true },
      }),
      this.prisma.community_posts.findMany({
        orderBy: { created_at: 'desc' },
        take: 30,
        include: { utilisateurs: true },
      }),
      this.prisma.event_highlights.findMany({
        orderBy: { created_at: 'desc' },
        take: 30,
        include: { utilisateurs: true },
      }),
      this.prisma.articles.findMany({
        orderBy: { created_at: 'desc' },
        take: 10,
        include: { utilisateurs: true },
      }),
      this.prisma.promos.findMany({
        where: { objet_statut: 'actif' },
        orderBy: { created_at: 'desc' },
        take: 10,
      }),
      this.prisma.lifestyle_posts.findMany({
        where: { objet_statut: 'actif' },
        orderBy: { created_at: 'desc' },
        take: 12,
      }),
      this.prisma.event_posts.findMany({
        orderBy: { created_at: 'desc' },
        take: 30,
        include: { utilisateurs: true, events: true },
      }),
    ]);

    // Normalize / tag
    const items: Array<any> = [
      ...stories.map(s => ({ _type: 'story', ...s, created_at: s.created_at || s.updated_at })),
      ...community.map(c => ({ _type: 'community', ...c, created_at: c.created_at })),
      ...highlights.map(h => ({ _type: 'highlight', ...h, created_at: h.created_at })),
      ...articles.map(a => ({ _type: 'article', ...a, created_at: a.created_at })),
      ...promos.map(p => ({ _type: 'promo', ...p, created_at: p.created_at })),
      ...lifestyle.map(l => ({ _type: 'lifestyle', ...l, created_at: l.created_at })),
      ...eventPosts.map(ep => ({ _type: 'event_post', ...ep, created_at: ep.created_at })),
    ];

    // Sort by date desc
    items.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    // Simple pagination on the merged feed
    const paginated = items.slice(skip, skip + limit);

    // Optionally annotate whether the user reacted / favorited each item (lightweight)
    // Example: find reactions by the user to items in this page
    const reactChecks = await Promise.all(
      paginated.map(async (it) => {
        // determine reactable_type and id mapping for reactions table conventions:
        const reactable_type = this.mapTypeToReactableType(it._type);
        const react = await this.prisma.reactions.findFirst({
          where: {
            utilisateur_id: userId,
            reactable_type,
            reactable_id: Number(it.id),
          },
        });
        return { id: it.id, reacted: !!react };
      }),
    );

    // attach reacted flag
    paginated.forEach(p => {
      const r = reactChecks.find(rc => rc.id === p.id);
      p._reacted = r ? r.reacted : false;
    });

    return {
      userId,
      page,
      limit,
      total: items.length,
      feed: paginated,
    };
  }

  private mapTypeToReactableType(type: string) {
    switch(type) {
      case 'community': return 'CommunityPost';
      case 'highlight': return 'EventHighlight';
      case 'article': return 'Article';
      case 'promo': return 'Promo';
      case 'lifestyle': return 'LifestylePost';
      case 'event_post': return 'EventPost';
      case 'story': return 'Story';
      default: return type;
    }
  }


// @Injectable()
// export class FeednewsService {
//   constructor(private prisma: PrismaService) {}

  async getHomeFeed(userId: number) {
    const now = new Date();

    const [
      stories,
      trendingEvents,
      clips,
      articles,
      promos,
      communityPosts,
      lifestyleImages,
      agenda,
      userStats,
      currentPoll,
    ] = await Promise.all([

      // 🟣 STORIES (non expirées)
      this.prisma.stories.findMany({
        where: {
          OR: [
            { expires_at: { gt: now } },
            // { expires_at: { equals: null } },
          ],
        //   objet_statut: 'actif',
        },
        orderBy: { created_at: 'desc' },
        take: 15,
        include: { utilisateurs: true },
      }),

    //   // 🔥 TRENDING EVENTS
    //   this.prisma.events.findMany({
    //     where: { statut: 'actif' },
    //     orderBy: { vues: 'desc' },
    //     take: 6,
    //   }),
        await this.prisma.events.findMany({
            where: { statut: 'actif' },
            orderBy: {
                vues: { _count: 'desc' }, // tri par nombre de vues liés
            },
            take: 6,
        }),

      // 🎬 CLIPS (highlights vidéos)
      this.prisma.event_highlights.findMany({
        where: {
          objet_statut: 'actif',
          type: 'video',
        },
        orderBy: { created_at: 'desc' },
        take: 10,
        include: { utilisateurs: true },
      }),

      // 📰 ARTICLES
      this.prisma.articles.findMany({
        where: { objet_statut: 'actif' },
        orderBy: { created_at: 'desc' },
        take: 5,
        include: { utilisateurs: true },
      }),

      // 🏷 PROMOS
      this.prisma.promos.findMany({
        where: { objet_statut: 'actif' },
        orderBy: { created_at: 'desc' },
        take: 5,
      }),

      // 💬 COMMUNITY POSTS
      this.prisma.community_posts.findMany({
        where: { objet_statut: 'actif' },
        orderBy: { created_at: 'desc' },
        take: 20,
        include: { utilisateurs: true },
      }),

      // 🖼 LIFESTYLE IMAGES (simple gallery)
      this.prisma.lifestyle_posts.findMany({
        where: { objet_statut: 'actif' },
        orderBy: { created_at: 'desc' },
        take: 12,
        select: { image: true },
      }),

      // 📅 AGENDA utilisateur
    //   this.prisma.events.findMany({
    //     where: {
    //       date_debut: { gte: now },
    //       participants: {
    //         some: { utilisateur_id: userId },
    //       },
    //     },
    //     orderBy: { date_debut: 'asc' },
    //     take: 5,
    //   }),
    this.prisma.events.findMany({
        where: {
            date_debut: { gte: now },
            billets: {
            some: { utilisateur_id: userId }, // l’utilisateur a acheté au moins un billet
            },
        },
        orderBy: { date_debut: 'asc' },
        take: 5,
        include: {
            _count: {
            select: { billets: true }, // compte le nombre de billets liés à l’événement
            },
        },
    }),

      // 📊 USER STATS
      this.prisma.utilisateurs.findUnique({
        where: { id: userId },
        select: {
          points: true,
          role: true,
          _count: {
            select: {
              community_posts: true,
              reactions: true,
            },
          },
        },
      }),

      // 🗳 CURRENT POLL (si existant)
    //   this.prisma.polls.findFirst({
    //     where: {
    //       objet_statut: actif,
    //       expires_at: { gt: now },
    //     },
    //     include: {
    //       options: {
    //         include: {
    //           _count: { select: { votes: true } },
    //         },
    //       },
    //     },
    //   }),
    await this.prisma.polls.findFirst({
        where: {
            objet_statut: "actif",
            // ⚠️ ajoute expires_at dans ton modèle Polls si tu veux filtrer par date
            // expires_at: { gt: now },
        },
        include: {
            options: true, // récupère toutes les options avec leurs champs (dont votes)
        },
    }),
    ]);

    return {
      stories,
      trendingEvents,
      clips,
      articles,
      promos,
      communityPosts,
      userStats: userStats
        ? {
            points: userStats.points,
            role: userStats.role,
            posts: userStats._count.community_posts,
            reactions: userStats._count.reactions,
          }
        : null,
      agenda,
      lifestyleImages: lifestyleImages.map(l => l.image),
      currentPoll,
    };
  }
}
