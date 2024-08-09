import {encode as ebase32, decode as dbase32} from './base32';
import bigInt from 'big-integer';

function stringToUint8Array(string) {
    const buffer = Buffer.from(string, 'hex');
    const arrayBuffer = new ArrayBuffer(buffer.length);
    const uint8Array = new Uint8Array(arrayBuffer);
    for (let i = 0; i < uint8Array.length; i += 1) {
        uint8Array[i] = buffer[i];
    }
    return uint8Array;
}

function getTypeBits(type) {
    switch (type) {
        case 'p2pkh':
        case 'P2PKH':
            return 0;
        case 'p2sh':
        case 'P2SH':
            return 8;
        default:
            return
    }
}

function getHashSizeBits(hash) {
    switch (hash.length * 8) {
        case 160:
            return 0;
        case 192:
            return 1;
        case 224:
            return 2;
        case 256:
            return 3;
        case 320:
            return 4;
        case 384:
            return 5;
        case 448:
            return 6;
        case 512:
            return 7;
        default:
            return
    }
}

function toUint5Array(data) {
    return convertBits(data, 8, 5);
}

function convertBits(data, from, to, strictMode) {
    var length = strictMode
        ? Math.floor((data.length * from) / to)
        : Math.ceil((data.length * from) / to);
    var mask = (1 << to) - 1;
    var result = new Uint8Array(length);
    var index = 0;
    var accumulator = 0;
    var bits = 0;
    for (var i = 0; i < data.length; ++i) {
        var value = data[i];
        if (value < 0 || value >> from !== 0) {
            return ""
        }
        accumulator = (accumulator << from) | value;
        bits += from;
        while (bits >= to) {
            bits -= to;
            result[index] = (accumulator >> bits) & mask;
            ++index;
        }
    }
    if (!strictMode) {
        if (bits > 0) {
            result[index] = (accumulator << (to - bits)) & mask;
            ++index;
        }
    } else {
        if (bits >= from || ((accumulator << (to - bits)) & mask) !== 0) {
            return ""
        }
    }
    return result;
}

function fromUint5Array(data) {
    return convertBits(data, 5, 8, true);
}

function concat(a, b) {
    var ab = new Uint8Array(a.length + b.length);
    ab.set(a);
    ab.set(b, a.length);
    return ab;
}

function checksumToUint5Array(checksum) {
    var result = new Uint8Array(8);
    for (var i = 0; i < 8; ++i) {
        result[7 - i] = checksum.and(31).toJSNumber();
        checksum = checksum.shiftRight(5);
    }
    return result;
}

function polymod(data) {
    var GENERATOR = [
        0x98f2bc8e61, 0x79b76d99e2, 0xf33e5fb3c4, 0xae2eabe2a8, 0x1e4f43e470,
    ];
    var checksum = bigInt(1);
    for (var i = 0; i < data.length; ++i) {
        var value = data[i];
        var topBits = checksum.shiftRight(35);
        checksum = checksum.and(0x07ffffffff).shiftLeft(5).xor(value);
        for (var j = 0; j < GENERATOR.length; ++j) {
            if (topBits.shiftRight(j).and(1).equals(1)) {
                checksum = checksum.xor(GENERATOR[j]);
            }
        }
    }
    return checksum.xor(1);
}

export const encode = (type, hash) => {
    if (typeof type !== 'string') {
        return ""
    }
    if (!(hash instanceof Uint8Array) && typeof hash !== 'string') {
        return ""
    }
    if (typeof hash === 'string') {
        hash = stringToUint8Array(hash)
    }
    var versionByte = getTypeBits(type.toUpperCase()) + getHashSizeBits(hash);
    var payloadData = toUint5Array(concat(new Uint8Array([versionByte]), hash));
    var checksumData = concat(
        payloadData,
        new Uint8Array(8),
    );
    var payload = concat(
        payloadData,
        checksumToUint5Array(polymod(checksumData)),
    );
    return ebase32(payload)
}

function validChecksum(payload) {
    return polymod(payload).equals(0);
}

function getType(versionByte) {
    switch (versionByte & 120) {
        case 0:
            return 'P2PKH';
        case 8:
            return 'P2SH';
        default:
            return
    }
}

export function decode(address) {
    if (typeof address !== 'string') {
        return 
    }
    let payload = dbase32(address)
    if (!validChecksum(payload)) {
        return
    }
    var payloadData = fromUint5Array(payload.subarray(0, -8));
    var versionByte = payloadData[0];
    var hash = payloadData.subarray(1);
    if (getHashSize(versionByte) !== hash.length * 8) {
        return
    }
    var type = getType(versionByte);
    return {
        type: type,
        hash: hash,
    }
}

export function getHashSize(versionByte) {
    switch (versionByte & 7) {
        case 0:
            return 160;
        case 1:
            return 192;
        case 2:
            return 224;
        case 3:
            return 256;
        case 4:
            return 320;
        case 5:
            return 384;
        case 6:
            return 448;
        case 7:
            return 512;
    }
}