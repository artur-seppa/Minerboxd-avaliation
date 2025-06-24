import UserActivity from "../../database/models/UserActivity.js";
import { ActivityAction } from "../../database/models/UserActivity.js";

export class UserActivityRssSerializer {
    private static getTitleAndDescription(action: ActivityAction): { title: string; description: string; category: string } {
        switch (action) {
            case ActivityAction.ADD_MOVIE_TO_WATCHLIST:
                return {
                    title: "Added Movie to Watchlist",
                    description: "User added a new movie to their watchlist",
                    category: "Watchlist"
                };
            case ActivityAction.REMOVE_MOVIE_FROM_WATCHLIST:
                return {
                    title: "Removed Movie from Watchlist",
                    description: "User removed a movie from their watchlist",
                    category: "Watchlist"
                };
            case ActivityAction.ADD_MOVIE_TO_WATCHEDLIST:
                return {
                    title: "Added Movie to Watched List",
                    description: "User marked a movie as watched",
                    category: "Watched"
                };
            case ActivityAction.REMOVE_MOVIE_FROM_WATCHEDLIST:
                return {
                    title: "Removed Movie from Watched List",
                    description: "User removed a movie from their watched list",
                    category: "Watched"
                };
        }
    }

    static serializeToRSS(activities: UserActivity[], userId: number): string {
        const baseUrl = 'http://localhost:3000';
        const lastBuildDate = new Date().toUTCString();
        const items = activities.map(activity => {
            const { title, description, category } = this.getTitleAndDescription(activity.action);
            return `
    <item>
      <title>${title}</title>
      <link>${baseUrl}/movies/${activity.movieId}</link>
      <guid isPermaLink="false">${activity.id}</guid>
      <description>${description}</description>
      <pubDate>${new Date(activity.createdAt).toUTCString()}</pubDate>
      <category>${category}</category>
    </item>`;
        }).join('\n');

        return `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Minerboxd User Activity Feed</title>
    <link>${baseUrl}/users/${userId}/rss</link>
    <description>Recent movie-related activities from MovieApp users</description>
    <language>en-us</language>
    <lastBuildDate>${lastBuildDate}</lastBuildDate>
    <atom:link href="${baseUrl}/users/${userId}/rss" rel="self" type="application/rss+xml" />${items}
  </channel>
</rss>`;
    }
}