/**
 * 2D Pixel Art Sprite Renderer for "อัศวินเวทมนตร์พิทักษ์ปราสาท"
 * Generates crisp offscreen pixel canvases from character palettes.
 */
(function (global) {
  const PALETTE = {
    '.': null,
    // Outlines & Neutrals
    'K': '#121024', // dark outline
    'W': '#ffffff', // pure white
    'S': '#d7e3ff', // soft icy white
    'G': '#8b9bb4', // cool gray

    // Wizard (Indigo, Gold, Arcane Cyan)
    'B': '#2d3a8c', // wizard robe/hat base
    'b': '#4a5fd9', // wizard robe highlight
    'N': '#1c2359', // wizard robe shadow
    'Y': '#ffd166', // gold trim / crown / bell
    'y': '#f4a226', // deep gold
    'F': '#ffdbac', // skin tone
    'C': '#5ef2ff', // cyan arcane crystal
    'c': '#24b5d6', // cyan mid
    'M': '#8d5524', // wooden staff

    // Slime (Emerald)
    'E': '#38d975', // slime main
    'e': '#1ea352', // slime shadow
    'L': '#9effb8', // slime highlight

    // Bat (Violet + Crimson)
    'V': '#5a2d82', // bat body
    'v': '#3b1959', // bat shadow
    'P': '#8f4ec7', // bat highlight
    'R': '#ff3b5c', // crimson red / dragon

    // Ghost (Spectral Cyan/Blue)
    'T': '#a8f0ff', // ghost body
    't': '#6dc6e8', // ghost shadow

    // Baby Dragon (Crimson + Amber)
    'r': '#b82038', // dragon shadow
    'O': '#ff8c42', // dragon belly/flame
    'A': '#ffe07d', // dragon horn/highlight

    // Fairy (Pink + Gold + Wing Cyan)
    'H': '#ff75b5', // fairy dress/pink
    'h': '#d6458a', // fairy pink shadow
    'Q': '#b8f7ff', // fairy wing

    // Magical Pet (Lavender Winged Cat Familiar)
    'U': '#f5ebff', // pet fur
    'u': '#ccb0f2', // pet fur shadow
    'Z': '#ff99cc', // pet ear/cheek
  };

  const SPRITE_MAPS = {
    wizard: [
      [
        '.......KK.......',
        '......KBBK......',
        '.....KBBBBK.....',
        '....KBBYYBBK....',
        '...KBBBBBBBBK...',
        '..KYYYYYYYYYYK..',
        '....KFFFFFFK....',
        '...KFKFFFFKFK...',
        '...KFFFFFFFFK..K',
        '..KBBbBBBBbBBKKC',
        '.KBBBbBBBBbBBKCK',
        '.KBNBbBBBBbBNKM.',
        '..KKBbBBBBbBKKM.',
        '....KBBBBBBK..M.',
        '....KBBKKBBK..M.',
        '....KKK..KKK..K.',
      ],
      [
        '.......KK.......',
        '......KBBK......',
        '.....KBBBBK.....',
        '....KBBYYBBK....',
        '...KBBBBBBBBK...',
        '..KYYYYYYYYYYK..',
        '....KFFFFFFK..KC',
        '...KFKFFFFKFKCKW',
        '...KFFFFFFFFKKCK',
        '..KBBbBBBBbBBKM.',
        '.KBBBbBBBBbBBKM.',
        '.KBNBbBBBBbBNKM.',
        '..KKBbBBBBbBKK..',
        '....KBBBBBBK....',
        '....KBBKKBBK....',
        '....KKK..KKK....',
      ],
    ],

    slime: [
      [
        '................',
        '......KKKK......',
        '....KKEEEEKK....',
        '...KELLLEEEEK...',
        '..KEELLEEEEEEK..',
        '..KEEEEEEEEEEK..',
        '.KEEEKKEEEKKEEK.',
        '.KEEEKWKEEKWKEK.',
        '.KEEEKKKEEEKKKE.',
        '.KEEEEEEEEEEEEK.',
        '.KEeEEEEEEEEeEK.',
        '.KEeeEEEEEEeeEK.',
        '..KKeeeeeeeeKK..',
        '....KKKKKKKK....',
        '................',
        '................',
      ],
      [
        '................',
        '................',
        '................',
        '.....KKKKKK.....',
        '...KKEEEEEEKK...',
        '..KELLLEEEEEEK..',
        '.KEELLEEEEEEEEK.',
        '.KEEEKKEEEKKEEK.',
        '.KEEEKWKEEKWKEK.',
        '.KEEEEEEEEEEEEK.',
        'KEEeEEEEEEEEeEEK',
        'KEeeEEEEEEEEeeEK',
        '.KKeeeeeeeeeeKK.',
        '...KKKKKKKKKK...',
        '................',
        '................',
      ],
    ],

    bat: [
      [
        '................',
        '.KK..........KK.',
        'KPPK..KKKK..KPPK',
        'KPVPKKVVVVKKVPVK',
        'KPVVVVVVVVVVVVPK',
        '.KVVVVRVVRVVVVK.',
        '.KvvvvVVVVvvvvK.',
        '..KKvVWWWWVvKK..',
        '....KKVVVVKK....',
        '.....KvvvvK.....',
        '....KK.KK.KK....',
        '................',
        '................',
        '................',
        '................',
        '................',
      ],
      [
        '................',
        '......KKKK......',
        '.....KVVVVK.....',
        '....KVVVVVVK....',
        '...KVVVRVRVVK...',
        '..KPvVVVVVVvPK..',
        '.KPPvVVWWVVvPPK.',
        'KPPK.KvvvvK.KPPK',
        'KPK..KvvvvK..KPK',
        '.K...KK..KK...K.',
        '................',
        '................',
        '................',
        '................',
        '................',
        '................',
      ],
    ],

    ghost: [
      [
        '.....KKKKKK.....',
        '...KKSSSSSSKK...',
        '..KSSWWWWWWSSK..',
        '.KSWWWWWWWWWWWK.',
        '.KSWWTTTTTTWWWK.',
        '.KSWKKTTTTKKTWK.',
        '.KSWKKWTTWKKTWK.',
        '.KSWTTTTTTTTTWK.',
        '.KSTTTTKKTTTTtK.',
        '.KSTTTTTTTTTTtK.',
        '.KSTttTTTTttTtK.',
        '..KSttKTTKtTTK..',
        '..KStK.KK.KtSK..',
        '...KK......KK...',
        '................',
        '................',
      ],
      [
        '................',
        '.....KKKKKK.....',
        '...KKSSSSSSKK...',
        '..KSSWWWWWWSSK..',
        '.KSWWWWWWWWWWWK.',
        '.KSWWTTTTTTWWWK.',
        '.KSWKKTTTTKKTWK.',
        '.KSWKKWTTWKKTWK.',
        '.KSWTTTTTTTTTWK.',
        '.KSTTTTKKTTTTtK.',
        '.KSTTTTTTTTTTtK.',
        '.KSTttTTTTttTtK.',
        '..KSttK..KttSK..',
        '...KKK....KKK...',
        '................',
        '................',
      ],
    ],

    dragon: [
      [
        '..KK........KK..',
        '.KAAK..KK..KAAK.',
        '.KrrKKRRRRKKrrK.',
        '..KRRRRRRRRRRK..',
        'KRRKRRRAARRRKRRK',
        'KRrKRRRRRRRRKrRK',
        'KrrKRRKRRKRRKrrK',
        '.KK.KROOOORK.KK.',
        '....KROOOORK....',
        '...KRRROORRRK...',
        '...KrrROORrrK...',
        '....KKRRRRKK....',
        '.....KRRKRRK....',
        '....KAAK.KAAK...',
        '................',
        '................',
      ],
      [
        '....K......K....',
        '...KAK....KAK...',
        '....KKRRRRKK....',
        '...KRRRRRRRRK...',
        '..KRRRRAARRRRK..',
        '..KRRRRRRRRRRK..',
        '.KKRRRKRRKRRRKK.',
        'KrrKKROOOORKKrrK',
        'KRRrKROOOORKrRRK',
        '.KK.KRRROORRK.KK',
        '....KrrROOrK....',
        '.....KKRRRRK....',
        '.....KRRKRRK....',
        '....KAAK.KAAK...',
        '................',
        '................',
      ],
    ],

    fairy: [
      [
        '.....KYYYYK.....',
        '....KYYYYYYK....',
        '...KYYFFFFYYK...',
        '.KKYFFKFFKFFYKK.',
        'KQQKFFFFFFFFKQQK',
        'KQWK.KHHHHK.KWQK',
        'KQQKKHHHHHHKKQQK',
        '.KK..KHHHHK..KK.',
        '....KHHHHHHK....',
        '....KhhHHhhK..YK',
        '.....KHHHHK..KYK',
        '.....KFFFFK...M.',
        '.....KFKKFK...M.',
        '.....KK..KK.....',
        '................',
        '................',
      ],
      [
        '.....KYYYYK.....',
        '....KYYYYYYK....',
        '...KYYFFFFYYK...',
        '..KYFFKFFKFFYK..',
        '.KQKFFFFFFFFKQK.',
        'KQQK.KHHHHK.KQQK',
        '.KK.KHHHHHHK.KK.',
        '....KHHHHHHK..YK',
        '....KHHHHHHK.KYK',
        '....KhhHHhhK..M.',
        '.....KHHHHK...M.',
        '.....KFFFFK.....',
        '.....KFKKFK.....',
        '.....KK..KK.....',
        '................',
        '................',
      ],
    ],

    pet: [
      [
        '..KK......KK....',
        '.KUUK....KUUK...',
        '.KUZUKKKKUZUK...',
        '..KUUUUUUUUK....',
        '.KUUUKUUUKUUUK..',
        '.KUUUKUUUKUUUK..',
        'KQQKUUZZUUUKQQK.',
        'KQWKUUUUUUUKWQK.',
        'KQQKUUUYYUUKQQK.',
        '.KK.KUUUUUUK.KK.',
        '....KuuuuuuK....',
        '....KUU..UUK....',
        '....KKK..KKK....',
        '................',
        '................',
        '................',
      ],
      [
        '..KK......KK....',
        '.KUUK....KUUK...',
        '.KUZUKKKKUZUK...',
        '..KUUUUUUUUK....',
        'KKUUKUUUUUKUUKK.',
        'KQKUUUKUUUKUUQK.',
        'KQKUUUZZUUUUUQK.',
        '.KKUUUUUUUUUUKK.',
        '....KUUYYUUK....',
        '....KUUUUUUK....',
        '....KuuuuuuK....',
        '....KUU..UUK....',
        '....KKK..KKK....',
        '................',
        '................',
        '................',
      ],
    ],
  };

  function buildCanvasFromGrid(grid, scale) {
    const rows = grid.length;
    const cols = grid[0].length;
    const c = document.createElement('canvas');
    c.width = cols * scale;
    c.height = rows * scale;
    const ctx = c.getContext('2d');
    ctx.imageSmoothingEnabled = false;

    for (let y = 0; y < rows; y++) {
      const row = grid[y];
      for (let x = 0; x < cols; x++) {
        const ch = row[x];
        const color = PALETTE[ch];
        if (color) {
          ctx.fillStyle = color;
          ctx.fillRect(x * scale, y * scale, scale, scale);
        }
      }
    }
    return c;
  }

  const SpriteBank = {
    frames: {},
    init(scale = 3) {
      for (const [name, frames] of Object.entries(SPRITE_MAPS)) {
        this.frames[name] = frames.map((grid) => buildCanvasFromGrid(grid, scale));
      }
    },
    get(name, frameIdx = 0) {
      const list = this.frames[name];
      if (!list || list.length === 0) return null;
      return list[frameIdx % list.length];
    },
    populateMiniLegends() {
      const nodes = document.querySelectorAll('.mini-sprite[data-sprite]');
      nodes.forEach((canvas) => {
        const key = canvas.getAttribute('data-sprite');
        const sprite = this.get(key, 0);
        if (!sprite) return;
        const ctx = canvas.getContext('2d');
        ctx.imageSmoothingEnabled = false;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(sprite, 0, 0, canvas.width, canvas.height);
      });
    },
  };

  global.SpriteBank = SpriteBank;
})(window);
