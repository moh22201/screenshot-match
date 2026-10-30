<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- VORTERRA is a browser 3D game (React Three Fiber), not Godot; 3D scenes live in src/components/*3D.tsx and are lazy-loaded so they never run during SSR.
- Region reservation happens only through the `claim_region` database function (atomic, one region per player); clients have read-only access to `regions`.
- Region attributes stay empty until the owner supplies real world data; never invent resources or numbers.
