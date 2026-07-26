<?php

declare(strict_types=1);

/**
 * Gerador de livros do Novo Testamento em JSON.
 *
 * Exemplos:
 *
 * php gerar-json.php 2-pedro
 * php gerar-json.php --livro=romanos
 * php gerar-json.php --todos
 * php gerar-json.php --listar
 *
 * Opções:
 *
 * --base=/caminho/arquivo.tsv
 * --saida=/caminho/dados/novo-testamento
 * --sobrescrever
 * --sem-portugues
 */

const VERSAO_GERADOR = '1.0.0';

main($argv);

/**
 * @param array<int,string> $argv
 */
function main(array $argv): void
{
    try {
        $opcoes = interpretarArgumentos($argv);

        $raiz = __DIR__;
        $livros = require $raiz . '/config/livros-nt.php';
        $glossario = require $raiz . '/config/glossario-pt.php';

        if ($opcoes['listar']) {
            listarLivros($livros);
            return;
        }

        $base = $opcoes['base']
            ?? $raiz . '/bases/macula-greek-SBLGNT.tsv';

        $saida = $opcoes['saida']
            ?? $raiz . '/dados/novo-testamento';

        validarAmbiente($base, $saida);

        if ($opcoes['todos']) {
            gerarTodos(
                livros: $livros,
                glossario: $glossario,
                base: $base,
                saida: $saida,
                sobrescrever: $opcoes['sobrescrever'],
                usarPortugues: !$opcoes['semPortugues']
            );

            return;
        }

        $idLivro = $opcoes['livro'];

        if ($idLivro === null) {
            mostrarAjuda();
            exit(1);
        }

        if (!isset($livros[$idLivro])) {
            throw new RuntimeException(
                "Livro não configurado: {$idLivro}\n"
                . 'Use: php gerar-json.php --listar'
            );
        }

        gerarLivro(
            idLivro: $idLivro,
            config: $livros[$idLivro],
            glossario: $glossario,
            base: $base,
            saida: $saida,
            sobrescrever: $opcoes['sobrescrever'],
            usarPortugues: !$opcoes['semPortugues']
        );
    } catch (Throwable $erro) {
        fwrite(STDERR, "\nERRO: {$erro->getMessage()}\n\n");
        exit(1);
    }
}

/**
 * @param array<int,string> $argv
 * @return array{
 *   livro:?string,
 *   todos:bool,
 *   listar:bool,
 *   base:?string,
 *   saida:?string,
 *   sobrescrever:bool,
 *   semPortugues:bool
 * }
 */
function interpretarArgumentos(array $argv): array
{
    $resultado = [
        'livro' => null,
        'todos' => false,
        'listar' => false,
        'base' => null,
        'saida' => null,
        'sobrescrever' => false,
        'semPortugues' => false,
    ];

    foreach (array_slice($argv, 1) as $argumento) {
        if ($argumento === '--todos') {
            $resultado['todos'] = true;
            continue;
        }

        if ($argumento === '--listar') {
            $resultado['listar'] = true;
            continue;
        }

        if ($argumento === '--sobrescrever') {
            $resultado['sobrescrever'] = true;
            continue;
        }

        if ($argumento === '--sem-portugues') {
            $resultado['semPortugues'] = true;
            continue;
        }

        if (str_starts_with($argumento, '--livro=')) {
            $resultado['livro'] = substr($argumento, 8);
            continue;
        }

        if (str_starts_with($argumento, '--base=')) {
            $resultado['base'] = substr($argumento, 7);
            continue;
        }

        if (str_starts_with($argumento, '--saida=')) {
            $resultado['saida'] = substr($argumento, 8);
            continue;
        }

        if (!str_starts_with($argumento, '--')) {
            $resultado['livro'] = $argumento;
        }
    }

    return $resultado;
}

function mostrarAjuda(): void
{
    echo <<<TXT

GERADOR DE JSON DO NOVO TESTAMENTO

Gerar um livro:
  php gerar-json.php 2-pedro

Gerar todos os livros:
  php gerar-json.php --todos

Listar os livros:
  php gerar-json.php --listar

Sobrescrever arquivos existentes:
  php gerar-json.php 2-pedro --sobrescrever

Definir uma base diferente:
  php gerar-json.php 2-pedro --base=C:\\bases\\macula.tsv

Definir outra pasta de saída:
  php gerar-json.php 2-pedro --saida=C:\\projeto\\dados\\novo-testamento

Não aplicar o glossário português:
  php gerar-json.php 2-pedro --sem-portugues

TXT;
}

/**
 * @param array<string,array<string,mixed>> $livros
 */
function listarLivros(array $livros): void
{
    uasort(
        $livros,
        static fn (array $a, array $b): int =>
            $a['ordem'] <=> $b['ordem']
    );

    foreach ($livros as $id => $config) {
        $ordem = str_pad((string) $config['ordem'], 2, '0', STR_PAD_LEFT);

        echo "{$ordem} - {$config['nome']} ({$id})\n";
    }
}

function validarAmbiente(string $base, string $saida): void
{
    if (PHP_VERSION_ID < 80000) {
        throw new RuntimeException(
            'Este gerador requer PHP 8.0 ou superior.'
        );
    }

    if (!class_exists(Normalizer::class)) {
        throw new RuntimeException(
            "A extensão PHP Intl não está ativada.\n"
            . "No Laragon, ative: Menu > PHP > Extensions > intl."
        );
    }

    if (!is_file($base)) {
        throw new RuntimeException(
            "Base não encontrada:\n{$base}\n\n"
            . "Coloque o arquivo em:\n"
            . __DIR__
            . "/bases/macula-greek-SBLGNT.tsv"
        );
    }

    if (!is_readable($base)) {
        throw new RuntimeException(
            "A base não pode ser lida:\n{$base}"
        );
    }

    if (!is_dir($saida) && !mkdir($saida, 0777, true) && !is_dir($saida)) {
        throw new RuntimeException(
            "Não foi possível criar a pasta de saída:\n{$saida}"
        );
    }

    if (!is_writable($saida)) {
        throw new RuntimeException(
            "A pasta de saída não possui permissão de escrita:\n{$saida}"
        );
    }
}

/**
 * @param array<string,array<string,mixed>> $livros
 * @param array<string,string> $glossario
 */
function gerarTodos(
    array $livros,
    array $glossario,
    string $base,
    string $saida,
    bool $sobrescrever,
    bool $usarPortugues
): void {
    uasort(
        $livros,
        static fn (array $a, array $b): int =>
            $a['ordem'] <=> $b['ordem']
    );

    $total = count($livros);
    $atual = 0;

    foreach ($livros as $idLivro => $config) {
        $atual++;

        echo "\n[{$atual}/{$total}] {$config['nome']}\n";

        gerarLivro(
            idLivro: $idLivro,
            config: $config,
            glossario: $glossario,
            base: $base,
            saida: $saida,
            sobrescrever: $sobrescrever,
            usarPortugues: $usarPortugues
        );
    }

    echo "\nTodos os livros foram processados.\n";
}

/**
 * @param array<string,mixed> $config
 * @param array<string,string> $glossario
 */
function gerarLivro(
    string $idLivro,
    array $config,
    array $glossario,
    string $base,
    string $saida,
    bool $sobrescrever,
    bool $usarPortugues
): void {
    $destino = rtrim($saida, '/\\')
        . DIRECTORY_SEPARATOR
        . $config['arquivo'];

    if (is_file($destino) && !$sobrescrever) {
        echo "Ignorado: {$destino} já existe.\n";
        echo "Use --sobrescrever para substituí-lo.\n";
        return;
    }

    $dados = lerLivroDaBase(
        base: $base,
        sigla: $config['sigla'],
        glossario: $glossario,
        usarPortugues: $usarPortugues
    );

    if ($dados['palavrasTotal'] === 0) {
        throw new RuntimeException(
            "Nenhuma palavra encontrada para {$config['nome']} "
            . "usando a sigla {$config['sigla']}."
        );
    }

    $resultado = [
        'ordem' => $config['ordem'],
        'id' => $idLivro,
        'livro' => $config['nome'],
        'abreviacao' => $config['abreviacao'],
        'testamento' => 'Novo Testamento',
        'idioma' => 'grego',
        'capitulosTotal' => count($dados['capitulos']),
        'versiculosTotal' => $dados['versiculosTotal'],
        'palavrasTotal' => $dados['palavrasTotal'],
        'fonteOriginal' => 'SBLGNT / MACULA Greek',
        'gerador' => [
            'nome' => 'Gerador PHP Teologia Ninja',
            'versao' => VERSAO_GERADOR,
            'geradoEm' => date(DATE_ATOM),
        ],
        'statusTraducao' => $usarPortugues
            ? 'Glosas portuguesas automáticas e preliminares; revisar'
            : 'Glosas originais em inglês da base MACULA',
        'capitulos' => $dados['capitulos'],
    ];

    $json = json_encode(
        $resultado,
        JSON_PRETTY_PRINT
        | JSON_UNESCAPED_UNICODE
        | JSON_UNESCAPED_SLASHES
        | JSON_THROW_ON_ERROR
    );

    if (file_put_contents($destino, $json . PHP_EOL) === false) {
        throw new RuntimeException(
            "Não foi possível salvar:\n{$destino}"
        );
    }

    echo "Gerado: {$destino}\n";
    echo "Capítulos: " . count($dados['capitulos']) . "\n";
    echo "Versículos: {$dados['versiculosTotal']}\n";
    echo "Palavras: {$dados['palavrasTotal']}\n";
}

/**
 * @param array<string,string> $glossario
 * @return array{
 *   capitulos:array<string,mixed>,
 *   versiculosTotal:int,
 *   palavrasTotal:int
 * }
 */
function lerLivroDaBase(
    string $base,
    string $sigla,
    array $glossario,
    bool $usarPortugues
): array {
    $arquivo = new SplFileObject($base, 'r');
    $arquivo->setFlags(
        SplFileObject::READ_CSV
        | SplFileObject::SKIP_EMPTY
        | SplFileObject::DROP_NEW_LINE
    );
    $arquivo->setCsvControl("\t");

    $cabecalho = null;
    $capitulos = [];
    $palavrasTotal = 0;

    foreach ($arquivo as $linha) {
        if (
            $linha === false
            || $linha === [null]
            || count($linha) === 0
        ) {
            continue;
        }

        if ($cabecalho === null) {
            $cabecalho = normalizarCabecalho($linha);
            validarCabecalho($cabecalho);
            continue;
        }

        if (count($linha) !== count($cabecalho)) {
            continue;
        }

        $dados = array_combine($cabecalho, $linha);

        if ($dados === false) {
            continue;
        }

        $referencia = trim((string) $dados['ref']);

        if (!str_starts_with($referencia, $sigla . ' ')) {
            continue;
        }

        $padrao = '/^'
            . preg_quote($sigla, '/')
            . ' (\d+):(\d+)!(\d+)$/';

        if (!preg_match($padrao, $referencia, $partes)) {
            continue;
        }

        $capitulo = (int) $partes[1];
        $versiculo = (int) $partes[2];

        $glosaInglesa = trim((string) $dados['english']);
        $glosaPortuguesa = $usarPortugues
            ? traduzirGlosa($glosaInglesa, $glossario)
            : $glosaInglesa;

        $original = (string) $dados['text'];
        $normalizado = trim((string) $dados['normalized']);
        $strong = trim((string) $dados['strong']);

        $palavra = [
            'original' => $original,
            'transliteracao' => transliterarGrego($original),
            'portugues' => $glosaPortuguesa,
            'glosaOriginal' => $glosaInglesa,
            'lema' => (string) $dados['lemma'],
            'strong' => $strong !== '' ? 'G' . $strong : '',
            'pronuncia' => strtolower(
                transliterarGrego(
                    $normalizado !== '' ? $normalizado : $original
                )
            ),
            'significado' => $glosaPortuguesa,
            'morfologia' => (string) $dados['morph'],
            'classe' => (string) $dados['class'],
            'apos' => (string) $dados['after'],
        ];

        $capitulos[$capitulo]['versiculos'][$versiculo]['palavras'][] =
            $palavra;

        $palavrasTotal++;
    }

    ksort($capitulos, SORT_NUMERIC);

    $versiculosTotal = 0;
    $capitulosFormatados = [];

    foreach ($capitulos as $numeroCapitulo => $capitulo) {
        $versiculos = $capitulo['versiculos'];
        ksort($versiculos, SORT_NUMERIC);

        $versiculosFormatados = [];

        foreach ($versiculos as $numeroVersiculo => $versiculo) {
            $palavras = $versiculo['palavras'];

            $versiculosFormatados[(string) $numeroVersiculo] = [
                'traducaoLiteral' => montarTraducaoLiteral($palavras),
                'palavras' => $palavras,
            ];

            $versiculosTotal++;
        }

        $capitulosFormatados[(string) $numeroCapitulo] = [
            'versiculos' => $versiculosFormatados,
        ];
    }

    return [
        'capitulos' => $capitulosFormatados,
        'versiculosTotal' => $versiculosTotal,
        'palavrasTotal' => $palavrasTotal,
    ];
}

/**
 * @param array<int,mixed> $cabecalho
 * @return array<int,string>
 */
function normalizarCabecalho(array $cabecalho): array
{
    return array_map(
        static function (mixed $valor): string {
            $texto = trim((string) $valor);

            return preg_replace(
                '/^\xEF\xBB\xBF/',
                '',
                $texto
            ) ?? $texto;
        },
        $cabecalho
    );
}

/**
 * @param array<int,string> $cabecalho
 */
function validarCabecalho(array $cabecalho): void
{
    $obrigatorias = [
        'ref',
        'text',
        'normalized',
        'lemma',
        'strong',
        'morph',
        'class',
        'english',
        'after',
    ];

    $faltando = array_values(
        array_diff($obrigatorias, $cabecalho)
    );

    if ($faltando !== []) {
        throw new RuntimeException(
            'Colunas ausentes na base: '
            . implode(', ', $faltando)
        );
    }
}

/**
 * @param array<string,string> $glossario
 */
function traduzirGlosa(
    string $glosa,
    array $glossario
): string {
    if ($glosa === '') {
        return '';
    }

    if (array_key_exists($glosa, $glossario)) {
        return $glossario[$glosa];
    }

    /*
     * Tenta traduzir expressões compostas palavra por palavra.
     * Se nada for traduzido, preserva o inglês para revisão.
     */
    $partes = preg_split(
        '/(\s+|[-–—])/u',
        $glosa,
        -1,
        PREG_SPLIT_DELIM_CAPTURE
    );

    if ($partes === false) {
        return $glosa;
    }

    $houveTraducao = false;

    foreach ($partes as &$parte) {
        $chave = trim($parte);

        if ($chave !== '' && isset($glossario[$chave])) {
            $parte = str_replace(
                $chave,
                $glossario[$chave],
                $parte
            );

            $houveTraducao = true;
        }
    }

    unset($parte);

    return $houveTraducao
        ? implode('', $partes)
        : $glosa;
}

/**
 * @param array<int,array<string,mixed>> $palavras
 */
function montarTraducaoLiteral(array $palavras): string
{
    $partes = [];

    foreach ($palavras as $palavra) {
        $partes[] = (string) ($palavra['portugues'] ?? '');
        $partes[] = (string) ($palavra['apos'] ?? ' ');
    }

    $texto = trim(implode('', $partes));

    $texto = preg_replace(
        '/\s+([,.;:?!])/u',
        '$1',
        $texto
    ) ?? $texto;

    $texto = preg_replace(
        '/\s{2,}/u',
        ' ',
        $texto
    ) ?? $texto;

    return $texto;
}

function transliterarGrego(string $texto): string
{
    $decomposto = Normalizer::normalize(
        $texto,
        Normalizer::FORM_D
    );

    if ($decomposto === false) {
        $decomposto = $texto;
    }

    $mapa = [
        'Α' => 'A',  'α' => 'a',
        'Β' => 'B',  'β' => 'b',
        'Γ' => 'G',  'γ' => 'g',
        'Δ' => 'D',  'δ' => 'd',
        'Ε' => 'E',  'ε' => 'e',
        'Ζ' => 'Z',  'ζ' => 'z',
        'Η' => 'Ē',  'η' => 'ē',
        'Θ' => 'Th', 'θ' => 'th',
        'Ι' => 'I',  'ι' => 'i',
        'Κ' => 'K',  'κ' => 'k',
        'Λ' => 'L',  'λ' => 'l',
        'Μ' => 'M',  'μ' => 'm',
        'Ν' => 'N',  'ν' => 'n',
        'Ξ' => 'X',  'ξ' => 'x',
        'Ο' => 'O',  'ο' => 'o',
        'Π' => 'P',  'π' => 'p',
        'Ρ' => 'R',  'ρ' => 'r',
        'Σ' => 'S',  'σ' => 's',
        'ς' => 's',
        'Τ' => 'T',  'τ' => 't',
        'Υ' => 'Y',  'υ' => 'y',
        'Φ' => 'Ph', 'φ' => 'ph',
        'Χ' => 'Ch', 'χ' => 'ch',
        'Ψ' => 'Ps', 'ψ' => 'ps',
        'Ω' => 'Ō',  'ω' => 'ō',
    ];

    $resultado = '';
    $caractereBase = '';
    $espiritoAspero = false;
    $iotaSubscrito = false;

    $caracteres = preg_split(
        '//u',
        $decomposto,
        -1,
        PREG_SPLIT_NO_EMPTY
    );

    if ($caracteres === false) {
        return $texto;
    }

    $adicionarGrupo = static function (
        string $base,
        bool $aspero,
        bool $iota
    ) use ($mapa): string {
        if ($base === '') {
            return '';
        }

        $transliterado = $mapa[$base] ?? $base;

        if ($aspero && isset($mapa[$base])) {
            $primeira = mb_substr($transliterado, 0, 1);
            $prefixo = mb_strtoupper($primeira) === $primeira
                ? 'H'
                : 'h';

            $transliterado = $prefixo . $transliterado;
        }

        if ($iota) {
            $transliterado .= 'i';
        }

        return $transliterado;
    };

    foreach ($caracteres as $caractere) {
        $codigo = mb_ord($caractere);

        /*
         * Faixa principal de marcas combinantes.
         */
        $combinante =
            ($codigo >= 0x0300 && $codigo <= 0x036F)
            || ($codigo >= 0x1DC0 && $codigo <= 0x1DFF);

        if ($combinante) {
            if ($codigo === 0x0314) {
                $espiritoAspero = true;
            }

            if ($codigo === 0x0345) {
                $iotaSubscrito = true;
            }

            continue;
        }

        $resultado .= $adicionarGrupo(
            $caractereBase,
            $espiritoAspero,
            $iotaSubscrito
        );

        $caractereBase = $caractere;
        $espiritoAspero = false;
        $iotaSubscrito = false;
    }

    $resultado .= $adicionarGrupo(
        $caractereBase,
        $espiritoAspero,
        $iotaSubscrito
    );

    $substituicoes = [
        'Oy' => 'Ou',
        'oy' => 'ou',
        'Ey' => 'Eu',
        'ey' => 'eu',
        'Ay' => 'Au',
        'ay' => 'au',
        'Ēy' => 'Ēu',
        'ēy' => 'ēu',
    ];

    $resultado = strtr($resultado, $substituicoes);

    /*
     * Gama nasal antes de consoante velar.
     */
    $resultado = preg_replace(
        '/g(?=(g|k|ch|x))/iu',
        'n',
        $resultado
    ) ?? $resultado;

    return $resultado;
}
