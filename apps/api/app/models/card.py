import enum
from typing import Annotated

from pydantic import AfterValidator, BeforeValidator
from sqlalchemy import String
from sqlalchemy.types import TypeDecorator


class Suit(str, enum.Enum):
    SPADES = "s"
    HEARTS = "h"
    DIAMONDS = "d"
    CLUBS = "c"


class Rank(str, enum.Enum):
    TWO = "2"
    THREE = "3"
    FOUR = "4"
    FIVE = "5"
    SIX = "6"
    SEVEN = "7"
    EIGHT = "8"
    NINE = "9"
    TEN = "T"
    JACK = "J"
    QUEEN = "Q"
    KING = "K"
    ACE = "A"


_RANK_ORDER = list(Rank)


class Card:
    def __init__(self, rank: Rank, suit: Suit) -> None:
        self.rank = rank
        self.suit = suit

    def __str__(self) -> str:
        return f"{self.rank.value}{self.suit.value}"

    def __repr__(self) -> str:
        return f"Card({self.rank.name}, {self.suit.name})"


def to_hand_notation(card1: Card, card2: Card) -> str:
    high, low = sorted(
        [card1, card2], key=lambda c: _RANK_ORDER.index(c.rank), reverse=True
    )
    if high.rank == low.rank:
        return f"{high.rank.value}{low.rank.value}"
    suffix = "s" if card1.suit == card2.suit else "o"
    return f"{high.rank.value}{low.rank.value}{suffix}"


def _validate_card(v: str) -> str:
    if len(v) != 2:
        raise ValueError(f"'{v}' is not a valid card (e.g. 'Ah', 'Ks')")
    try:
        Rank(v[0])
        Suit(v[1])
    except ValueError:
        raise ValueError(f"'{v}' is not a valid card (e.g. 'Ah', 'Ks')")
    return v


CardStr = Annotated[str, BeforeValidator(str), AfterValidator(_validate_card)]


class CardType(TypeDecorator):
    impl = String(2)
    cache_ok = True

    def process_bind_param(self, value: Card | None, dialect) -> str | None:
        return str(value) if value is not None else None

    def process_result_value(self, value: str | None, dialect) -> Card | None:
        if value is None:
            return None
        return Card(Rank(value[0]), Suit(value[1]))
