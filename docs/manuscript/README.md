# Timeline Generator software manuscript

The manuscript describes the application's data model, browser interaction,
and verification with a fictional graph. The ordered sources run from the
[abstract](00_abstract.md) through the [scope and limitations](04_scope.md).
The [bibliography](references.bib) supplies the final references section.
[CITATION.cff](../../CITATION.cff) identifies the software for citation.

The [fictional graph](fixtures/fictional-graph.json) defines the people,
relationships, and event in the [browser capture](figures/fictional-timeline.png).
The [figure registry](figure_registry.json) binds the capture to its caption
and alt text. The demonstration used the built frontend and real graph,
person, and edge routes with the repository's in-memory test store. The
fixture is separate from the distributed historical seed data.

## Render and validate

Use the [pinned Template checkout](https://github.com/docxology/template/tree/87704feae0a4490ef7dad9c931d268e8c30273c2).
Prepare uv, Pandoc with a compatible pandoc-crossref, and XeLaTeX following
the [Template run guide](https://github.com/docxology/template/blob/87704feae0a4490ef7dad9c931d268e8c30273c2/docs/RUN_GUIDE.md).
The commands below assume the Timeline Generator checkout is a sibling of
the Template checkout. The [Template project guide](https://github.com/docxology/template/blob/87704feae0a4490ef7dad9c931d268e8c30273c2/projects/README.md)
explains the working project registration.

```sh
git clone https://github.com/docxology/template.git template
cd template
git checkout --detach 87704feae0a4490ef7dad9c931d268e8c30273c2
uv sync --locked --no-dev --python 3.14
mkdir -p projects/working
git -C ../timeline_generator worktree add --detach \
  "$PWD/projects/working/timeline_generator" HEAD
project=projects/working/timeline_generator
mkdir -p "$project/output/figures"
cp "$project/docs/manuscript/figures/fictional-timeline.png" "$project/output/figures/"
cp "$project/docs/manuscript/figure_registry.json" "$project/output/figures/"
uv run --no-sync python scripts/pipeline/stage_03_render.py --project working/timeline_generator
uv run --no-sync python scripts/pipeline/stage_04_validate.py --project working/timeline_generator
```

The renderer reads `docs/manuscript/` in the registered checkout. It writes
`output/pdf/timeline_generator_combined.pdf`, `output/web/index.html`, and a
validation report under `output/reports/`. Rendering uses the saved capture
and requires neither an application server nor a provider account.
