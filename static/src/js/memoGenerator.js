import { openDB } from 'idb';

export async function GetMemos() {
    let response = await fetch("/Home/GetMemos");
    let memos = await response.json();

    return {
        count: memos.length,
        memosGenerator: MemoGenerator(memos)
    };
}

async function* MemoGenerator(memos) {
    for (const memo of memos) {
        yield memo;
    }
}

async function WriteToIndexedDB(memos) {

    let db = await openDB('MemoDB', 1, {
        upgrade(db) {
            db.createObjectStore('Memos');
        },
    });

    let transaction = db.transaction('Memos', 'readwrite');
    transaction.store.clear();

    memos.forEach(memo => {
        transaction.store.add(memo);
    });

    await transaction.done;

    db.close();
}