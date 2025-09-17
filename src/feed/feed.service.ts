import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

@Injectable()
export class FeedService {
  async getFeed(params: { pageType: string; limit: number; cursor?: string }) {
    const { pageType, limit, cursor } = params;

    // Exemple : récupérer des events (tu peux adapter selon pageType)
    const events = await prisma.events.findMany({
      take: limit,
      orderBy: { created_at: 'desc' },
      ...(cursor && { skip: 1, cursor: { id: Number(cursor) } }),
    });

    // const articles = await prisma.articles.findMany({
    //   take: limit,
    //   orderBy: { created_at: 'desc' },
    // });

    // Exemple : transformer les résultats en format attendu par Flutter
    const items = [
      {
        type: 'section_header',
        payload: {
          title: 'Événements Populaires',
          subtitle: 'Découvrez les plus tendances',
        },
      },
      ...events.map((e) => ({
        type: 'event',
        payload: {
          id: e.id,
          titre: e.titre,
          date_debut: e.date_debut,
          date_fin: e.date_fin,
          lieu: e.lieu,
          affiche: e.affiche,
        },
      })),
      // ...articles.map((a) => ({
      //   type: 'article',
      //   payload: {
      //     id: a.id,
      //     title: a.title,
      //     content: a.content,
      //     image: a.image,
      //   },
      // })),
    ];

    // Pagination simplifiée
    const nextCursor = events.length > 0 ? events[events.length - 1].id : null;

    return {
      data: items,
      nextCursor,
      hasMore: !!nextCursor,
    };
  }
}


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