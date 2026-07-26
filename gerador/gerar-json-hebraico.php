<?php

declare(strict_types=1);

/**
 * Gerador de JSON do Antigo Testamento — MACULA Hebrew / WLC.
 *
 * Exemplos:
 *
 * php gerar-json-hebraico.php genesis
 * php gerar-json-hebraico.php --todos
 * php gerar-json-hebraico.php --listar
 * php gerar-json-hebraico.php genesis --sobrescrever
 *
 * Caminho padrão da base:
 *
 * bases/macula-hebrew/WLC/tsv/
 *
 * O gerador aceita:
 * - um único TSV contendo toda a Bíblia;
 * - um TSV por livro;
 * - TSVs dentro de subpastas.
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
        $livros = require __DIR__ . '/config/livros-vt.php';

        if ($opcoes['listar']) {
            listarLivros($livros);
            return;
        }

        $base = $opcoes['base']
            ?? localizarBasePadrao(__DIR__ . '/bases');

        $saida = $opcoes['saida']
            ?? __DIR__ . '/dados/antigo-testamento';

        validarAmbiente($base, $saida);

        if ($opcoes['inspecionar']) {
            inspecionarBase($base);
            return;
        }

        if ($opcoes['todos']) {
            gerarTodos(
                livros: $livros,
                base: $base,
                saida: $saida,
                sobrescrever: $opcoes['sobrescrever']
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
                . "Use: php gerar-json-hebraico.php --listar"
            );
        }

        gerarLivro(
            idLivro: $idLivro,
            config: $livros[$idLivro],
            base: $base,
            saida: $saida,
            sobrescrever: $opcoes['sobrescrever']
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
 *   inspecionar:bool,
 *   base:?string,
 *   saida:?string,
 *   sobrescrever:bool
 * }
 */
function interpretarArgumentos(array $argv): array
{
    $resultado = [
        'livro' => null,
        'todos' => false,
        'listar' => false,
        'inspecionar' => false,
        'base' => null,
        'saida' => null,
        'sobrescrever' => false,
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

        if ($argumento === '--inspecionar') {
            $resultado['inspecionar'] = true;
            continue;
        }

        if ($argumento === '--sobrescrever') {
            $resultado['sobrescrever'] = true;
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

        if (str_starts_with($argumento, '--livro=')) {
            $resultado['livro'] = substr($argumento, 8);
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

GERADOR DO ANTIGO TESTAMENTO — MACULA HEBREW

Gerar um livro:
  php gerar-json-hebraico.php genesis

Gerar todos:
  php gerar-json-hebraico.php --todos

Listar livros:
  php gerar-json-hebraico.php --listar

Inspecionar a estrutura da base:
  php gerar-json-hebraico.php --inspecionar

Sobrescrever arquivos existentes:
  php gerar-json-hebraico.php --todos --sobrescrever

Indicar outra pasta da base:
  php gerar-json-hebraico.php genesis --base=C:\\bases\\macula-hebrew\\WLC\\tsv

Indicar outra saída:
  php gerar-json-hebraico.php genesis --saida=C:\\projeto\\dados\\antigo-testamento

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


/**
 * Localiza automaticamente a base hebraica dentro da pasta bases.
 *
 * Estruturas aceitas:
 *
 * bases/macula-hebrew/WLC/tsv/
 * bases/WLC/tsv/
 * bases/hebraico/
 * bases/
 */
function localizarBasePadrao(string $pastaBases): string
{
    $candidatos = [
        $pastaBases . '/macula-hebrew/WLC/tsv',
        $pastaBases . '/macula-hebrew/WLC/TSV',
        $pastaBases . '/WLC/tsv',
        $pastaBases . '/WLC/TSV',
        $pastaBases . '/hebraico',
        $pastaBases,
    ];

    foreach ($candidatos as $candidato) {
        if (!is_dir($candidato) && !is_file($candidato)) {
            continue;
        }

        if (localizarTsvs($candidato) !== []) {
            return $candidato;
        }
    }

    throw new RuntimeException(
        "Base hebraica não encontrada.\n\n"
        . "Coloque a MACULA Hebrew dentro de uma destas estruturas:\n"
        . __DIR__ . "/bases/macula-hebrew/WLC/tsv\n"
        . __DIR__ . "/bases/WLC/tsv\n"
        . __DIR__ . "/bases/hebraico\n\n"
        . "Ou informe manualmente:\n"
        . "php gerar-json-hebraico.php genesis "
        . "--base=C:\\caminho\\macula-hebrew\\WLC\\tsv"
    );
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
            . "No Laragon: Menu > PHP > Extensions > intl."
        );
    }

    if (!is_dir($base) && !is_file($base)) {
        throw new RuntimeException(
            "Base não encontrada:\n{$base}\n\n"
            . "O caminho padrão esperado é:\n"
            . __DIR__
            . "/bases/macula-hebrew/WLC/tsv"
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

function inspecionarBase(string $base): void
{
    $arquivos = localizarTsvs($base);

    echo "TSVs encontrados: " . count($arquivos) . "\n\n";

    foreach (array_slice($arquivos, 0, 20) as $arquivo) {
        echo $arquivo . "\n";

        $cabecalho = lerCabecalho($arquivo);
        echo '  Colunas: ' . implode(' | ', $cabecalho) . "\n\n";
    }

    if (count($arquivos) > 20) {
        echo "... e mais " . (count($arquivos) - 20) . " arquivos.\n";
    }
}

/**
 * @param array<string,array<string,mixed>> $livros
 */
function gerarTodos(
    array $livros,
    string $base,
    string $saida,
    bool $sobrescrever
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
            base: $base,
            saida: $saida,
            sobrescrever: $sobrescrever
        );
    }

    echo "\nTodos os livros foram processados.\n";
}

/**
 * @param array<string,mixed> $config
 */
function gerarLivro(
    string $idLivro,
    array $config,
    string $base,
    string $saida,
    bool $sobrescrever
): void {
    $destino = rtrim($saida, '/\\')
        . DIRECTORY_SEPARATOR
        . $config['arquivo'];

    if (is_file($destino) && !$sobrescrever) {
        echo "Ignorado: {$destino} já existe.\n";
        echo "Use --sobrescrever para substituí-lo.\n";
        return;
    }

    $arquivos = localizarTsvs($base);

    if ($arquivos === []) {
        throw new RuntimeException(
            "Nenhum arquivo TSV encontrado em:\n{$base}"
        );
    }

    $dados = lerLivro(
        arquivos: $arquivos,
        config: $config
    );

    if ($dados['palavrasTotal'] === 0) {
        throw new RuntimeException(
            "Nenhuma palavra encontrada para {$config['nome']}.\n"
            . "Execute --inspecionar para conferir as colunas e arquivos."
        );
    }

    $resultado = [
        'ordem' => $config['ordem'],
        'id' => $idLivro,
        'livro' => $config['nome'],
        'abreviacao' => $config['abreviacao'],
        'testamento' => 'Antigo Testamento',
        'idioma' => 'hebraico',
        'capitulosTotal' => count($dados['capitulos']),
        'versiculosTotal' => $dados['versiculosTotal'],
        'palavrasTotal' => $dados['palavrasTotal'],
        'fonteOriginal' => 'WLC / MACULA Hebrew',
        'statusTraducao' => (
            'Glosas da base preservadas; português preliminar quando disponível; '
            . 'revisão exegética recomendada'
        ),
        'gerador' => [
            'nome' => 'Gerador Hebraico PHP — Teologia Ninja',
            'versao' => VERSAO_GERADOR,
            'geradoEm' => date(DATE_ATOM),
        ],
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
 * @return array<int,string>
 */
function localizarTsvs(string $base): array
{
    if (is_file($base)) {
        return strtolower(pathinfo($base, PATHINFO_EXTENSION)) === 'tsv'
            ? [$base]
            : [];
    }

    $arquivos = [];

    $iterator = new RecursiveIteratorIterator(
        new RecursiveDirectoryIterator(
            $base,
            FilesystemIterator::SKIP_DOTS
        )
    );

    foreach ($iterator as $arquivo) {
        if (!$arquivo instanceof SplFileInfo || !$arquivo->isFile()) {
            continue;
        }

        if (strtolower($arquivo->getExtension()) !== 'tsv') {
            continue;
        }

        /*
         * Ignora arquivos de mapeamento que não contêm o texto bíblico.
         */
        $nome = strtolower($arquivo->getFilename());

        if (
            str_contains($nome, 'marble_map')
            || str_contains($nome, 'unmapped')
            || str_contains($nome, 'mapping')
        ) {
            continue;
        }

        $arquivos[] = $arquivo->getPathname();
    }

    sort($arquivos, SORT_NATURAL | SORT_FLAG_CASE);

    return $arquivos;
}

/**
 * @param array<int,string> $arquivos
 * @param array<string,mixed> $config
 * @return array{
 *   capitulos:array<string,mixed>,
 *   versiculosTotal:int,
 *   palavrasTotal:int
 * }
 */
function lerLivro(array $arquivos, array $config): array
{
    $capitulos = [];
    $palavrasTotal = 0;

    foreach ($arquivos as $caminho) {
        $arquivo = new SplFileObject($caminho, 'r');
        $arquivo->setFlags(
            SplFileObject::READ_CSV
            | SplFileObject::SKIP_EMPTY
            | SplFileObject::DROP_NEW_LINE
        );
        $arquivo->setCsvControl("\t");

        $cabecalho = null;
        $mapaColunas = null;

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
                $mapaColunas = detectarColunas($cabecalho);
                continue;
            }

            if (count($linha) !== count($cabecalho)) {
                continue;
            }

            $registro = array_combine($cabecalho, $linha);

            if ($registro === false || $mapaColunas === null) {
                continue;
            }

            $referencia = valorColuna(
                $registro,
                $mapaColunas['referencia']
            );

            $coordenadas = extrairReferencia(
                referencia: $referencia,
                caminhoArquivo: $caminho,
                config: $config,
                registro: $registro,
                mapa: $mapaColunas
            );

            if ($coordenadas === null) {
                continue;
            }

            [$capitulo, $versiculo] = $coordenadas;

            $original = valorColuna(
                $registro,
                $mapaColunas['texto']
            );

            if ($original === '') {
                continue;
            }

            $lema = valorColuna(
                $registro,
                $mapaColunas['lema']
            );

            $strongBruto = valorColuna(
                $registro,
                $mapaColunas['strong']
            );

            $glosa = valorColuna(
                $registro,
                $mapaColunas['glosa']
            );

            $morfologia = valorColuna(
                $registro,
                $mapaColunas['morfologia']
            );

            $classe = valorColuna(
                $registro,
                $mapaColunas['classe']
            );

            $idioma = valorColuna(
                $registro,
                $mapaColunas['idioma']
            );

            $apos = valorColuna(
                $registro,
                $mapaColunas['apos']
            );

            $normalizado = valorColuna(
                $registro,
                $mapaColunas['normalizado']
            );

            $strong = normalizarStrongHebraico($strongBruto);

            $palavra = [
                'original' => $original,
                'transliteracao' => transliterarHebraico($original),
                'portugues' => $glosa,
                'glosaOriginal' => $glosa,
                'lema' => $lema,
                'strong' => $strong,
                'pronuncia' => strtolower(
                    transliterarHebraico(
                        $normalizado !== ''
                            ? $normalizado
                            : $original
                    )
                ),
                'significado' => $glosa,
                'morfologia' => $morfologia,
                'classe' => $classe,
                'idiomaOriginal' => detectarIdioma(
                    $idioma,
                    $morfologia
                ),
                'apos' => $apos !== '' ? $apos : ' ',
            ];

            $capitulos[$capitulo]['versiculos'][$versiculo]['palavras'][] =
                $palavra;

            $palavrasTotal++;
        }
    }

    ksort($capitulos, SORT_NUMERIC);

    $capitulosFormatados = [];
    $versiculosTotal = 0;

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
 * Detecta os nomes das colunas sem depender de uma versão específica da base.
 *
 * @param array<int,string> $cabecalho
 * @return array<string,?string>
 */
function detectarColunas(array $cabecalho): array
{
    return [
        'referencia' => localizarColuna(
            $cabecalho,
            ['ref', 'reference', 'osisref', 'osis_ref', 'verse', 'id']
        ),
        'livro' => localizarColuna(
            $cabecalho,
            ['book', 'bookcode', 'book_code', 'bookid']
        ),
        'capitulo' => localizarColuna(
            $cabecalho,
            ['chapter', 'chap', 'chapter_number']
        ),
        'versiculo' => localizarColuna(
            $cabecalho,
            ['verse_number', 'versenum', 'verse_num', 'verse']
        ),
        'texto' => localizarColuna(
            $cabecalho,
            ['text', 'word', 'unicode', 'surface', 'form', 'wlc']
        ),
        'normalizado' => localizarColuna(
            $cabecalho,
            ['normalized', 'normalised', 'word_no_accents', 'consonantal']
        ),
        'lema' => localizarColuna(
            $cabecalho,
            ['lemma', 'lexeme', 'lex']
        ),
        'strong' => localizarColuna(
            $cabecalho,
            ['strong', 'strongs', 'strongnumber', 'strong_number']
        ),
        'morfologia' => localizarColuna(
            $cabecalho,
            ['morph', 'morphology', 'morphcode', 'morph_code']
        ),
        'classe' => localizarColuna(
            $cabecalho,
            ['class', 'pos', 'partofspeech', 'part_of_speech']
        ),
        'glosa' => localizarColuna(
            $cabecalho,
            ['english', 'gloss', 'glosses', 'translation', 'sense']
        ),
        'idioma' => localizarColuna(
            $cabecalho,
            ['language', 'lang']
        ),
        'apos' => localizarColuna(
            $cabecalho,
            ['after', 'trailing', 'space_after', 'punctuation']
        ),
    ];
}

/**
 * @param array<int,string> $cabecalho
 * @param array<int,string> $candidatos
 */
function localizarColuna(
    array $cabecalho,
    array $candidatos
): ?string {
    $normalizados = [];

    foreach ($cabecalho as $coluna) {
        $chave = strtolower(
            preg_replace('/[^a-z0-9]/i', '', $coluna) ?? $coluna
        );

        $normalizados[$chave] = $coluna;
    }

    foreach ($candidatos as $candidato) {
        $chave = strtolower(
            preg_replace('/[^a-z0-9]/i', '', $candidato) ?? $candidato
        );

        if (isset($normalizados[$chave])) {
            return $normalizados[$chave];
        }
    }

    return null;
}

/**
 * @param array<string,mixed> $registro
 */
function valorColuna(
    array $registro,
    ?string $coluna
): string {
    if ($coluna === null || !array_key_exists($coluna, $registro)) {
        return '';
    }

    return trim((string) $registro[$coluna]);
}

/**
 * @param array<string,mixed> $config
 * @param array<string,mixed> $registro
 * @param array<string,?string> $mapa
 * @return array{0:int,1:int}|null
 */
function extrairReferencia(
    string $referencia,
    string $caminhoArquivo,
    array $config,
    array $registro,
    array $mapa
): ?array {
    $aliases = $config['siglas'];

    /*
     * Formatos comuns:
     * GEN 1:1!1
     * Gen.1.1.1
     * GEN 1:1
     * Gen 1:1
     */
    foreach ($aliases as $alias) {
        $aliasEscapado = preg_quote($alias, '/');

        $padroes = [
            '/^' . $aliasEscapado . '\s+(\d+):(\d+)(?:!\d+)?$/iu',
            '/^' . $aliasEscapado . '\.(\d+)\.(\d+)(?:\.\d+)?$/iu',
            '/^' . $aliasEscapado . '[:\s](\d+)[:.](\d+)(?:[!.]\d+)?$/iu',
        ];

        foreach ($padroes as $padrao) {
            if (preg_match($padrao, $referencia, $partes)) {
                return [(int) $partes[1], (int) $partes[2]];
            }
        }
    }

    /*
     * Quando a base traz livro, capítulo e versículo em colunas separadas.
     */
    $livro = valorColuna($registro, $mapa['livro']);
    $capitulo = valorColuna($registro, $mapa['capitulo']);
    $versiculo = valorColuna($registro, $mapa['versiculo']);

    if (
        $livro !== ''
        && $capitulo !== ''
        && $versiculo !== ''
        && aliasConfere($livro, $aliases)
    ) {
        return [(int) $capitulo, (int) $versiculo];
    }

    /*
     * Quando existe um TSV por livro e a referência contém só capítulo/versículo.
     */
    $nomeArquivo = pathinfo($caminhoArquivo, PATHINFO_FILENAME);

    if (aliasConfere($nomeArquivo, $aliases)) {
        if (preg_match('/(?:^|\D)(\d+)[:.](\d+)(?:[!.]\d+)?$/', $referencia, $partes)) {
            return [(int) $partes[1], (int) $partes[2]];
        }
    }

    return null;
}

/**
 * @param array<int,string> $aliases
 */
function aliasConfere(string $valor, array $aliases): bool
{
    $normalizado = normalizarIdentificador($valor);

    foreach ($aliases as $alias) {
        if ($normalizado === normalizarIdentificador($alias)) {
            return true;
        }
    }

    return false;
}

function normalizarIdentificador(string $valor): string
{
    return strtolower(
        preg_replace('/[^a-z0-9]/i', '', $valor) ?? $valor
    );
}

function normalizarStrongHebraico(string $strong): string
{
    if ($strong === '') {
        return '';
    }

    if (preg_match('/H?(\d+)/i', $strong, $partes)) {
        return 'H' . ltrim($partes[1], '0');
    }

    return $strong;
}

function detectarIdioma(
    string $idioma,
    string $morfologia
): string {
    $texto = strtolower($idioma . ' ' . $morfologia);

    if (
        str_contains($texto, 'aramaic')
        || str_contains($texto, 'aramaico')
        || preg_match('/(^|[^a-z])a(?=[a-z])/', $texto)
    ) {
        return 'aramaico';
    }

    return 'hebraico';
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

/**
 * Transliteração acadêmica simplificada.
 *
 * Remove cantilação, preserva consoantes e trata sinais vocálicos comuns.
 * É adequada para exibição inicial, mas pode ser refinada futuramente.
 */
function transliterarHebraico(string $texto): string
{
    if ($texto === '') {
        return '';
    }

    $decomposto = Normalizer::normalize(
        $texto,
        Normalizer::FORM_D
    );

    if ($decomposto === false) {
        $decomposto = $texto;
    }

    $mapaConsoantes = [
        'א' => 'ʾ',
        'ב' => 'v',
        'ג' => 'g',
        'ד' => 'd',
        'ה' => 'h',
        'ו' => 'v',
        'ז' => 'z',
        'ח' => 'ḥ',
        'ט' => 'ṭ',
        'י' => 'y',
        'כ' => 'kh',
        'ך' => 'kh',
        'ל' => 'l',
        'מ' => 'm',
        'ם' => 'm',
        'נ' => 'n',
        'ן' => 'n',
        'ס' => 's',
        'ע' => 'ʿ',
        'פ' => 'f',
        'ף' => 'f',
        'צ' => 'ts',
        'ץ' => 'ts',
        'ק' => 'q',
        'ר' => 'r',
        'ש' => 'sh',
        'ת' => 't',
    ];

    $mapaVogais = [
        0x05B0 => 'e',   // sheva
        0x05B1 => 'e',   // hataf segol
        0x05B2 => 'a',   // hataf patah
        0x05B3 => 'o',   // hataf qamats
        0x05B4 => 'i',   // hiriq
        0x05B5 => 'e',   // tsere
        0x05B6 => 'e',   // segol
        0x05B7 => 'a',   // patah
        0x05B8 => 'a',   // qamats
        0x05B9 => 'o',   // holam
        0x05BA => 'o',   // holam haser
        0x05BB => 'u',   // qubuts
        0x05C7 => 'o',   // qamats qatan
    ];

    $caracteres = preg_split(
        '//u',
        $decomposto,
        -1,
        PREG_SPLIT_NO_EMPTY
    );

    if ($caracteres === false) {
        return $texto;
    }

    $resultado = '';
    $ultimoHebraico = '';

    foreach ($caracteres as $caractere) {
        $codigo = mb_ord($caractere);

        /*
         * Cantilação massorética: ignora.
         */
        if ($codigo >= 0x0591 && $codigo <= 0x05AF) {
            continue;
        }

        if (isset($mapaVogais[$codigo])) {
            $resultado .= $mapaVogais[$codigo];
            continue;
        }

        /*
         * Dagesh: ajusta algumas consoantes begadkefat.
         */
        if ($codigo === 0x05BC) {
            $ajustes = [
                'v' => 'b',
                'kh' => 'k',
                'f' => 'p',
            ];

            foreach ($ajustes as $antes => $depois) {
                if (str_ends_with($resultado, $antes)) {
                    $resultado = mb_substr(
                        $resultado,
                        0,
                        mb_strlen($resultado) - mb_strlen($antes)
                    ) . $depois;
                    break;
                }
            }

            continue;
        }

        /*
         * Shin dot / sin dot.
         */
        if ($codigo === 0x05C1 && str_ends_with($resultado, 'sh')) {
            continue;
        }

        if ($codigo === 0x05C2 && str_ends_with($resultado, 'sh')) {
            $resultado = mb_substr(
                $resultado,
                0,
                mb_strlen($resultado) - 2
            ) . 's';
            continue;
        }

        /*
         * Maqqef vira hífen.
         */
        if ($codigo === 0x05BE) {
            $resultado .= '-';
            continue;
        }

        /*
         * Sof pasuq e outros sinais finais.
         */
        if (in_array($codigo, [0x05C0, 0x05C3, 0x05C6], true)) {
            continue;
        }

        if (isset($mapaConsoantes[$caractere])) {
            $resultado .= $mapaConsoantes[$caractere];
            $ultimoHebraico = $caractere;
            continue;
        }

        /*
         * Preserva pontuação e espaços comuns.
         */
        if (!preg_match('/\p{M}/u', $caractere)) {
            $resultado .= $caractere;
        }
    }

    $resultado = preg_replace('/e{2,}/u', 'e', $resultado) ?? $resultado;
    $resultado = preg_replace('/a{2,}/u', 'a', $resultado) ?? $resultado;
    $resultado = preg_replace('/o{2,}/u', 'o', $resultado) ?? $resultado;

    return trim($resultado);
}

/**
 * @return array<int,string>
 */
function lerCabecalho(string $arquivo): array
{
    $objeto = new SplFileObject($arquivo, 'r');
    $objeto->setCsvControl("\t");

    $linha = $objeto->fgetcsv();

    if ($linha === false || $linha === [null]) {
        return [];
    }

    return normalizarCabecalho($linha);
}
