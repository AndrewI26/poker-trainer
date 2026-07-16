import enum

from sqlalchemy import Enum as SQLAlchemyEnum


class Position(enum.StrEnum):
    UTG = "UTG"
    UTG_PLUS_1 = "UTG+1"
    UTG_PLUS_2 = "UTG+2"
    LJ = "LJ"
    HJ = "HJ"
    CO = "CO"
    BTN = "BTN"
    SB = "SB"
    BB = "BB"


class Move(enum.StrEnum):
    FOLD = "fold"
    CALL = "call"
    RAISE = "raise"
    ALLIN = "allin"


class MoveVerdict(enum.StrEnum):
    CORRECT = "correct"
    ACCEPTABLE = "acceptable"
    INCORRECT = "incorrect"


PositionType = SQLAlchemyEnum(
    Position, name="table_position", values_callable=lambda e: [m.value for m in e]
)
MoveType = SQLAlchemyEnum(
    Move, name="preflop_move", values_callable=lambda e: [m.value for m in e]
)
MoveVerdictType = SQLAlchemyEnum(
    MoveVerdict, name="move_verdict", values_callable=lambda e: [m.value for m in e]
)
