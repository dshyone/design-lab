import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Prototype } from '../models/prototype.model';
import { Asset } from '../models/asset.model';
import { environment } from '../../../environments/environment';

interface GitHubFileResponse {
  content: string;
  sha: string;
  encoding: string;
}

@Injectable({ providedIn: 'root' })
export class GithubService {
  private http = inject(HttpClient);
  private base = `https://api.github.com/repos/${environment.githubOwner}/${environment.githubRepo}/contents`;

  getPrototypes(): Observable<{ prototypes: Prototype[]; sha: string }> {
    return this.http
      .get<GitHubFileResponse>(`${this.base}/prototypes.json`)
      .pipe(
        map((res) => ({
          prototypes: JSON.parse(atob(res.content.replace(/\n/g, ''))) as Prototype[],
          sha: res.sha,
        }))
      );
  }

  savePrototypes(prototypes: Prototype[], sha: string, pat: string): Observable<unknown> {
    const headers = new HttpHeaders({ Authorization: `token ${pat}` });
    const content = btoa(JSON.stringify(prototypes, null, 2));
    return this.http.put(
      `${this.base}/prototypes.json`,
      { message: 'Update prototypes.json via Design Lab', content, sha, branch: environment.githubBranch },
      { headers }
    );
  }

  getAssets(): Observable<{ assets: Asset[]; sha: string }> {
    return this.http
      .get<GitHubFileResponse>(`${this.base}/assets.json`)
      .pipe(
        map((res) => ({
          assets: JSON.parse(atob(res.content.replace(/\n/g, ''))) as Asset[],
          sha: res.sha,
        }))
      );
  }

  saveAssets(assets: Asset[], sha: string, pat: string): Observable<unknown> {
    const headers = new HttpHeaders({ Authorization: `token ${pat}` });
    const content = btoa(JSON.stringify(assets, null, 2));
    return this.http.put(
      `${this.base}/assets.json`,
      { message: 'Update assets.json via Design Lab', content, sha, branch: environment.githubBranch },
      { headers }
    );
  }
}
