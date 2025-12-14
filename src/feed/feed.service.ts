// import { Injectable } from '@nestjs/common';
// import { PrismaClient } from '@prisma/client';

// const prisma = new PrismaClient();

// @Injectable()
// export class FeedService {
//   async getFeed(params: { pageType: string; limit: number; cursor?: string }) {
//     const { pageType, limit, cursor } = params;

//     // Exemple : récupérer des events (tu peux adapter selon pageType)
//     const events = await prisma.events.findMany({
//       take: limit,
//       orderBy: { created_at: 'desc' },
//       ...(cursor && { skip: 1, cursor: { id: Number(cursor) } }),
//     });


//     // Exemple : transformer les résultats en format attendu par Flutter
//     const items = [
//       {
//         type: 'section_header',
//         payload: {
//           title: 'Événements Populaires',
//           subtitle: 'Découvrez les plus tendances',
//         },
//       },
//       ...events.map((e) => ({
//         type: 'event',
//         payload: {
//           id: e.id,
//           titre: e.titre,
//           date_debut: e.date_debut,
//           date_fin: e.date_fin,
//           lieu: e.lieu,
//           affiche: e.affiche,
//         },
//       })),
      
    
//     ];

//     // Pagination simplifiée
//     const nextCursor = events.length > 0 ? events[events.length - 1].id : null;

//     return {
//       data: items,
//       nextCursor,
//       hasMore: !!nextCursor,
//     };
//   }
// }
// const articles = await prisma.articles.findMany({
    //   take: limit,
    //   orderBy: { created_at: 'desc' },
    // });
      // ...articles.map((a) => ({
      //   type: 'article',
      //   payload: {
      //     id: a.id,
      //     title: a.title,
      //     content: a.content,
      //     image: a.image,
      //   },
      // })),

// import { Injectable } from '@nestjs/common';
// import { PrismaService } from '../prisma/prisma.service';

// @Injectable()
// export class FeedService {
//   constructor(private prisma: PrismaService) {}

//   async getFeed() {
//     return this.prisma.event.findMany({
//       orderBy: { date: 'asc' },
//     });
//   }
// }


// import { Injectable } from '@nestjs/common';
// import { PrismaClient } from '@prisma/client';

// const prisma = new PrismaClient();

// @Injectable()
// export class FeedService {
//   async getFeed(limit: number, pageType: string, cursor?: number) {
//     let where: any = {};
//     if (pageType === 'events') {
//       // filtre si besoin
//     }

//     const items = await prisma.event.findMany({
//       where,
//       orderBy: { created_at: 'desc' },
//       take: limit + 1,
//       ...(cursor && { skip: 1, cursor: { id: cursor } }),
//     });

//     const hasMore = items.length > limit;
//     let nextCursor: number | null = null;

//     if (hasMore) {
//       const lastItem = items.pop(); // retire l’excédent
//       nextCursor = lastItem?.id ?? null;
//     }

//     return {
//       items: items.map((event) => ({
//         id: event.id,
//         title: event.nom,
//         description: event.description,
//         imageUrl: event.image,
//         date: event.date_debut.toISOString(),
//         type: 'event',
//       })),
//       nextCursor,
//       hasMore,
//     };
//   }
// }

import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

@Injectable()
export class FeedService {
  async getFeed(userId: number, params: { limit?: number; cursor?: string }) {
    const { limit = 10, cursor } = params;
    const now = new Date();

    // 1️⃣ Événements Populaires (par nombre de vues)
    const popularEvents = await prisma.events.findMany({
      take: limit,
      orderBy: { vues: { _count: 'desc' } }, // basé sur relation EventVue
      include: { vues: true },
    });

    // 2️⃣ Événements proches du user (par géolocalisation)
    const nearbyEvents = await prisma.events.findMany({
      where: {
        latitude: { not: null },
        longitude: { not: null },
      },
      take: limit,
      orderBy: { date_debut: 'asc' },
    });
    // ⚠️ Ici tu peux calculer la distance avec les coordonnées du user si tu stockes sa position

    // 3️⃣ Événements suivis par le user
    const followedEvents = await prisma.events.findMany({
      where: {
        favoris: { some: { utilisateur_id: BigInt(userId) } },
      },
      take: limit,
      orderBy: { created_at: 'desc' },
    });

    // 4️⃣ Événements billets achetés
    const purchasedEvents = await prisma.events.findMany({
      where: {
        billets: { some: { utilisateur_id: BigInt(userId) } },
      },
      take: limit,
      orderBy: { date_debut: 'asc' },
    });

    // 5️⃣ Événements avec le plus de points
    const highPointEvents = await prisma.events.findMany({
      take: limit,
      orderBy: { points: 'desc' },
    });

    // 6️⃣ Événements les plus vus
    const mostViewedEvents = await prisma.events.findMany({
      take: limit,
      orderBy: { vues: { _count: 'desc' } },
    });

    // 7️⃣ Articles récents
    const articles = await prisma.articles.findMany({
      take: limit,
      orderBy: { created_at: 'desc' },
      include: { utilisateurs: true },
    });

    // 🧩 Transformer en payloads
    const items = [
      {
        type: 'section_header',
        payload: { title: 'Événements Populaires', subtitle: 'Découvrez les plus tendances' },
      },
      ...popularEvents.map(e => ({ type: 'event', payload: e })),

      {
        type: 'section_header',
        payload: { title: 'Événements Proches', subtitle: 'Autour de vous' },
      },
      ...nearbyEvents.map(e => ({ type: 'event', payload: e })),

      {
        type: 'section_header',
        payload: { title: 'Événements Suivis', subtitle: 'Vos favoris' },
      },
      ...followedEvents.map(e => ({ type: 'event', payload: e })),

      {
        type: 'section_header',
        payload: { title: 'Billets Achetés', subtitle: 'Vos participations' },
      },
      ...purchasedEvents.map(e => ({ type: 'event', payload: e })),

      {
        type: 'section_header',
        payload: { title: 'Événements avec le plus de points', subtitle: 'Les plus récompensés' },
      },
      ...highPointEvents.map(e => ({ type: 'event', payload: e })),

      {
        type: 'section_header',
        payload: { title: 'Événements les plus vus', subtitle: 'Ce que tout le monde regarde' },
      },
      ...mostViewedEvents.map(e => ({ type: 'event', payload: e })),

      {
        type: 'section_header',
        payload: { title: 'Articles', subtitle: 'À lire absolument' },
      },
      ...articles.map(a => ({ type: 'article', payload: a })),
    ];

    return {
      data: items,
      hasMore: false, // tu peux gérer la pagination par section si besoin
    };
  }
}
